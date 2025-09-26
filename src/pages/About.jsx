import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const About = () => {

  const teamMembers = [
    {
      name: "Nguyễn Thị Khánh Ly",
      position: "Founder & CEO",
      image: "/images/team/NguyenThiKhanhLy.jpg",
      description: ""
    },
    {
      name: "Võ Hồng Quang",
      position: "Operations Manager",
      image: "/images/team/VoHongQuang.jpg",
      description: ""
    },
    {
      name: "Trần Nguyễn Nam Khánh",
      position: "Training & QA Manager",
      image: "/images/team/TranNguyenNamKhanh.jpg",
      description: ""
    },
    {
      name: "Trần Minh Quân",
      position: "IT Manager",
      image: "/images/team/TranMinhQuan.jpg",
      description: ""
    },    
    {
      name: "Trần Thái Thiện",
      position: "Production Manager",
      image: "/images/team/TranThaiThien.png",
      description: ""
    },
    {
      name: "Dương Chí Công",
      position: "Branding & Digital Marketing Manager",
      image: "/images/team/DuongChiCong.jpg",
      description: ""
    },
  ];

  const milestones = [
    {
      year: "2022",
      title: "Khởi đầu hành trình",
      description: "Bắt đầu quán cà phê tại một góc nhỏ ở Bình Thạnh"
    },
    {
      year: "2023",
      title: "Thay đổi địa điểm",
      description: "Chọn Vinhomes Grand Park trở thành nơi phát triển lâu dài"
    },
    {
      year: "1/2024",
      title: "Ra mắt thương hiệu",
      description: "Chính thức ra mắt thương hiệu Balan Coffee & Roastery tại Vinhomes Grand Park"
    },
    {
      year: "3/2024",
      title: "Một tầm nhìn xa hơn",
      description: "Chúng tôi chọn đưa trải nghiệm cà phê cá nhân hóa đến gần hơn với mọi người"
    },
    {
      year: "2025",
      title: "Trở thành một doanh nghiệp",
      description: "Ra mắt nền tảng thương mại điện tử"
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Balan Coffee & Roastery",
    "description": "Premium Vietnamese coffee roastery specializing in Arabica Cầu Đất and Robusta Lâm Đồng",
    "url": window.location.origin,
    "logo": `${window.location.origin}/dist/logo.png`,
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Coffee Street",
        "addressLocality": "Ho Chi Minh City",
        "addressCountry": "VN"
    },
    "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+84-123-456-789",
        "contactType": "customer service"
    },
    "sameAs": [
        "https://facebook.com/balancoffee",
        "https://instagram.com/balancoffee"
    ]
  };

  return (
    <>      <Helmet>
        <title>Giới thiệu - Balan Coffee & Roastery</title>
        <meta name="description" content="Tìm hiểu về hành trình 25 năm phát triển của Balan Coffee & Roastery - từ vườn cà phê nhỏ tại Đà Lạt đến thương hiệu cà phê đặc sản hàng đầu Việt Nam" />
        <meta name="keywords" content="về chúng tôi, lịch sử balan coffee, cà phê đặc sản việt nam, rang xay cà phê, arabica cầu đất, robusta lâm đồng" />
        <link rel="canonical" href={`${window.location.origin}/about`} />
        <meta property="og:title" content="Giới thiệu - Balan Coffee & Roastery" />
        <meta property="og:description" content="Tìm hiểu về hành trình 25 năm phát triển của Balan Coffee & Roastery - từ vườn cà phê nhỏ tại Đà Lạt đến thương hiệu cà phê đặc sản hàng đầu Việt Nam" />
        <meta property="og:url" content={`${window.location.origin}/about`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${window.location.origin}/images/about/hero-image.jpg`} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-cream-50">
        {/* Hero Section */}
        <section className="relative h-screen flex items-end justify-center overflow-hidden pb-20">
          <div className="absolute inset-0 z-10"></div>
          <img src="/images/banners/about_banner.png"
            alt="About Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
            <Link
              to="/products"
              className="inline-block bg-brand-primary text-brand-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-primary/90 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Câu chuyện thương hiệu
                </h2>
                <div className="prose prose-lg text-gray-700">
                  <p className="mb-4">
                    Balan Coffee & Roastery ra đời với một niềm tin đơn giản: "Mỗi ly cà phê phải phản chiếu câu chuyện của người thưởng thức."
                    Chúng tôi không chỉ pha chế cà phê – chúng tôi kiến tạo trải nghiệm 
                    cá nhân hóa, nơi mỗi vị đắng, ngọt, chua hay hậu vị đều được điều chỉnh để chạm đúng gu của bạn.
                  </p>
                  <p className="mb-4">
                    Balan khởi đầu với một niềm đam mê giản dị dành cho cà phê và mong muốn tạo ra trải nghiệm khác biệt. 
                    Chúng tôi vẫn đang từng bước thử nghiệm, lắng nghe và hoàn thiện, để mỗi ly cà phê mang lại cảm giác gần với “gu” mà bạn tìm kiếm.
                  </p>
                  <p>
                    Cà phê ở Việt Nam chưa bao giờ chỉ là một thức uống. 
                    Đó là không gian của đối thoại, của suy tư và của sự kết nối. 
                    Balan Coffee & Roastery được sinh ra để trở thành nơi bạn có thể dừng lại, 
                    tận hưởng và tìm thấy gu của chính mình.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="/images/banners/story_banner.png"
                  alt="Coffee processing"
                  className="rounded-lg shadow-xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-brand-primary text-brand-white p-6 rounded-lg">
                  <div className="text-3xl font-bold">3+</div>
                  <div className="text-sm">Năm phát triển</div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">            
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Hành trình phát triển
              </h2>
              <p className="text-xl text-gray-600">
                Những cột mốc quan trọng trong lịch sử phát triển
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-brand-primary/20"></div>              
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className={`relative flex items-center mb-12 ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}>
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-brand-primary rounded-full border-4 border-white shadow-lg z-10"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <div className="bg-cream-50 p-6 rounded-lg shadow-md">
                      <div className="text-2xl font-bold text-brand-primary mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-cream-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">            
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Đội ngũ chuyên gia
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Những con người tạo nên chất lượng đặc biệt của Balan Coffee
              </p>
            </div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamMembers.map((member) => (
                <div key={member.name} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-64 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {member.name}
                    </h3>
                    <div className="text-brand-primary font-medium mb-3">
                      {member.position}
                    </div>
                    <p className="text-gray-600 text-sm">
                      {member.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;

