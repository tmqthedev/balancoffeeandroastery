// Firebase Authentication Service
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  FacebookAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { COLLECTIONS } from '../../database/firestore-schema';

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const { email, password, firstName, lastName, phone } = userData;
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // Create user document in Firestore
      const userDoc = {
        email: user.email,
        firstName,
        lastName,
        phone: phone || '',
        address: '',
        city: '',
        postalCode: '',
        role: 'customer',
        isActive: true,
        emailVerified: false,
        facebookId: '',
        profileImage: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userDoc);

      // Send email verification
      await sendEmailVerification(user);

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...userDoc
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Login user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore
      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      const userData = userDoc.data();

      // Check if user is active
      if (!userData.isActive) {
        throw new Error('Account is deactivated');
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...userData
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Facebook login
  async loginWithFacebook() {
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userDocRef);

      let userData;

      if (!userDoc.exists()) {
        // Create new user document
        const names = user.displayName?.split(' ') || ['', ''];
        userData = {
          email: user.email,
          firstName: names[0] || '',
          lastName: names.slice(1).join(' ') || '',
          phone: '',
          address: '',
          city: '',
          postalCode: '',
          role: 'customer',
          isActive: true,
          emailVerified: user.emailVerified,
          facebookId: user.providerData[0]?.uid || '',
          profileImage: user.photoURL || '',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await setDoc(userDocRef, userData);
      } else {
        userData = userDoc.data();
        
        // Update last login and profile image if needed
        await updateDoc(userDocRef, {
          updatedAt: new Date(),
          profileImage: user.photoURL || userData.profileImage
        });
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          ...userData
        }
      };
    } catch (error) {
      console.error('Facebook login error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Logout user
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Failed to logout');
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Update user profile
  async updateUserProfile(userId, userData) {
    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, userId);
      
      await updateDoc(userDocRef, {
        ...userData,
        updatedAt: new Date()
      });

      // Update Firebase Auth profile if name changed
      if (userData.firstName || userData.lastName) {
        await updateProfile(auth.currentUser, {
          displayName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    }
  }

  // Get current user data
  async getCurrentUserData() {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) return null;

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  }

  // Auth state observer
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await this.getCurrentUserData();
        callback(userData);
      } else {
        callback(null);
      }
    });
  }

  // Get error message
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Email không tồn tại',
      'auth/wrong-password': 'Mật khẩu không đúng',
      'auth/email-already-in-use': 'Email đã được sử dụng',
      'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự)',
      'auth/invalid-email': 'Email không hợp lệ',
      'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa',
      'auth/too-many-requests': 'Quá nhiều yêu cầu, vui lòng thử lại sau',
      'auth/network-request-failed': 'Lỗi kết nối mạng',
      'auth/popup-closed-by-user': 'Cửa sổ đăng nhập bị đóng'
    };

    return errorMessages[errorCode] || 'Đã xảy ra lỗi, vui lòng thử lại';
  }
}

export default new AuthService();
