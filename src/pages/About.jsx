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
      image: "/images/team/TranThaiThien.jpg",
      description: ""
    },
    {
      name: "Nguyễn Quang Thanh",
      position: "Sales Manager",
      image: "/images/team/NguyenQuangThanh.jpg",
      description: ""
    }
  ];

  const milestones = [
    {
      year: "Tuổi thơ",
      title: "Tách cà phê của Bố",
      description: "Mỗi sáng, một tách cà phê là cách duy nhất người cha thể hiện tình yêu cho con gái. Dù tình yêu đó ẩn sau những lời la mắng, nhưng chính điều ấy đã dạy cô rằng tình yêu không chỉ ngọt ngào – đôi khi nó mang vị đắng, như cà phê."
    },
    {
      year: "Lớn lên từ đắng cay",
      title: "Nghị lực hình thành từ vị đắng",
      description: "Từ những cay đắng trong tuổi thơ, cô gái tìm thấy nghị lực để trở thành “nhân tố ngọt bùi” cho gia đình mình và dần nuôi dưỡng ước mơ cống hiến cho xã hội."
    },
    {
      year: "Khởi nghiệp",
      title: "Sai lầm và bài học",
      description: "Bước vào kinh doanh, những vấp ngã đầu tiên trở thành vốn sống quý báu. Chính những sai lầm ấy giúp cô rút ra kinh nghiệm để đồng hành, hỗ trợ các chủ quán khác tránh lặp lại, cùng nhau phát triển."
    },
    {
      year: "Năm đầu tiên",
      title: "Ý nghĩ bỏ cuộc và sự kiên trì",
      description: "Có lúc tưởng chừng phải dừng lại vì thua lỗ nặng nề. Nhưng cô vẫn lựa chọn làm lại từ đầu, sai đâu sửa đó. Từ một thương hiệu lặng lẽ, sau một năm kiên trì, Balan Coffee đã trở thành một cửa hàng nhộn nhịp, với nhiều lời mời hợp tác kinh doanh."
    },
    {
      year: "Cột mốc trưởng thành",
      title: "Niềm tự hào và sự biết ơn",
      description: "Có người từng ngỏ ý mua lại thương hiệu, nhưng cô từ chối. Bởi Balan Coffee không chỉ là một thương hiệu – mà là “đứa con” cô đã nuôi dưỡng. Tự hào hơn nữa, “đứa con” ấy còn tạo công ăn việc làm, giúp đỡ nhiều nhân sự gắn bó đến tận hôm nay."
    },
    {
      year: "Tương lai",
      title: "Phát triển cùng nhau",
      description: "Với cô, thành công của Balan Coffee không chỉ là doanh thu hay thương hiệu được biết đến rộng rãi – mà là khi tập thể nhân sự đồng hành cùng phát triển, cùng hưởng thành quả và cùng viết tiếp hành trình phía trước."
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
        <section className="relative h-screen flex items-end justify-center overflow-hidden pb-16 sm:pb-20">
          <div className="absolute inset-0 z-10"></div>
          <img src="/images/banners/about_banner.png"
            alt="About Banner"
            className="absolute inset-0 w-full h-full object-contain sm:object-contain sm:object-center"
          />
          <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
            <Link
              to="/products"
              className="inline-block bg-brand-primary text-brand-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-brand-primary/90 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Câu chuyện thương hiệu
                </h2>
                <div className="prose prose-base sm:prose-lg text-gray-700">
                  <p className="mb-3 sm:mb-4 text-sm sm:text-base">
                    Balan Coffee & Roastery khởi nguồn từ một triết lý rất giản dị: 
                    kinh doanh và xây dựng thương hiệu phải bắt đầu từ những điều mộc mạc 
                    và cơ bản nhất. Với chúng tôi, cà phê không chỉ để uống – mà để thưởng thức, 
                    từ hương vị, từ thái độ phục vụ đến trải nghiệm mà khách hàng cảm nhận.
                  </p>
                  <p className="mb-3 sm:mb-4 text-sm sm:text-base">
                    Chúng tôi tin rằng, chỉ khi làm từ Tâm và xuất phát từ sự Chân Thành, 
                    từng hạt cà phê mới thực sự chạm đến trái tim người thưởng thức. 
                    Cũng như bản chất mộc mạc của cà phê, Balan giữ trọn sự tử tế: 
                    từ khâu chọn nguyên liệu, cách rang xay cho đến cách đưa từng ly 
                    cà phê đến tay khách hàng.
                  </p>
                  <p className="text-sm sm:text-base">
                    Balan Coffee & Roastery mong muốn trở thành một nơi thật gần gũi – 
                    nơi bạn có thể dừng lại giữa nhịp sống hối hả, nhâm nhi một ly cà phê 
                    được tạo ra bằng tất cả sự chân thành, để rồi tìm thấy sự kết nối, 
                    sự an yên và hương vị đúng “gu” của riêng mình.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="/images/banners/story_banner.png"
                  alt="Coffee processing"
                  className="rounded-lg shadow-xl"
                />
                <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-brand-primary text-brand-white p-4 sm:p-6 rounded-lg">
                  <div className="text-2xl sm:text-3xl font-bold">3+</div>
                  <div className="text-xs sm:text-sm">Năm phát triển</div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">            
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
                Hành trình phát triển
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Những cột mốc quan trọng trong lịch sử phát triển
              </p>
            </div>

            <div className="relative">
              {/* Timeline line - hidden on mobile, visible on desktop */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-brand-primary/20"></div>
              {/* Mobile timeline line - vertical line on left */}
              <div className="md:hidden absolute left-4 top-0 w-0.5 h-full bg-brand-primary/20"></div>
              
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className={`relative mb-8 md:mb-12 ${
                  // Desktop: alternating layout, Mobile: all items aligned left
                  'md:flex md:items-center ' + (index % 2 === 0 ? 'md:justify-start' : 'md:justify-end')
                }`}>
                  {/* Timeline dot */}
                  <div className="absolute w-3 h-3 md:w-4 md:h-4 bg-brand-primary rounded-full border-2 md:border-4 border-white shadow-lg z-10 left-3 md:left-1/2 md:transform md:-translate-x-1/2 top-2"></div>
                  
                  {/* Content */}
                  <div className={`ml-8 md:ml-0 md:w-5/12 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                    <div className="bg-cream-50 p-4 md:p-6 rounded-lg shadow-md">
                      <div className="text-lg md:text-2xl font-bold text-brand-primary mb-1 md:mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-base md:text-xl text-gray-900 mb-1 md:mb-2 italic">
                        {milestone.title}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
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
        <section className="py-12 sm:py-16 lg:py-20 bg-cream-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">            
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Đội ngũ chuyên gia
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Những con người tạo nên chất lượng đặc biệt của Balan Coffee
              </p>
            </div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {teamMembers.map((member) => (
                <div key={member.name} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 sm:h-56 lg:h-64 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
                      {member.name}
                    </h3>
                    <div className="text-sm sm:text-base text-brand-primary font-medium mb-2 sm:mb-3 italic">
                      {member.position}
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm">
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

