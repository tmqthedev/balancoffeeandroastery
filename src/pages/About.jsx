import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const About = () => {

  const teamMembers = [
    {
      name: "Nguyễn Văn Minh",
      position: "Founder & Master Roaster",
      image: "/images/team/founder.jpg",
      description: "25 năm kinh nghiệm trong ngành cà phê với đam mê rang xay và phát triển các dòng cà phê đặc sản Việt Nam."
    },
    {
      name: "Trần Thị Lan",
      position: "Quality Control Manager",
      image: "/images/team/qc-manager.jpg",
      description: "Chuyên gia về chất lượng cà phê với chứng chỉ Q Grader quốc tế, đảm bảo mỗi hạt cà phê đều đạt tiêu chuẩn cao nhất."
    },
    {
      name: "Lê Hoàng Nam",
      position: "Head Barista",
      image: "/images/team/head-barista.jpg",
      description: "Nhà vô địch Barista Championship Việt Nam 2023, am hiểu sâu sắc về nghệ thuật pha chế cà phê."
    }
  ];

  const milestones = [
    {
      year: "1998",
      title: "Khởi đầu hành trình",
      description: "Bắt đầu với một vườn cà phê nhỏ tại Đà Lạt"
    },
    {
      year: "2005",
      title: "Mở rộng sản xuất",
      description: "Xây dựng nhà máy rang xay đầu tiên"
    },
    {
      year: "2012",
      title: "Ra mắt thương hiệu",
      description: "Chính thức ra mắt thương hiệu Balan Coffee & Roastery"
    },
    {
      year: "2018",
      title: "Chứng nhận quốc tế",
      description: "Đạt chứng nhận Organic và Fair Trade"
    },
    {
      year: "2023",
      title: "Kỷ nguyên số",
      description: "Ra mắt nền tảng thương mại điện tử"
    }
  ];

  const values = [
    {
      icon: "🌱",
      title: "Bền vững",
      description: "Cam kết phát triển bền vững từ trang trại đến tách cà phê"
    },
    {
      icon: "⭐",
      title: "Chất lượng",
      description: "Không ngừng nâng cao chất lượng sản phẩm và dịch vụ"
    },
    {
      icon: "🤝",
      title: "Tôn trọng",
      description: "Tôn trọng người nông dân và môi trường tự nhiên"
    },
    {
      icon: "💡",
      title: "Sáng tạo",
      description: "Luôn tìm kiếm những phương pháp mới để hoàn thiện hương vị"
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Balan Coffee & Roastery",
    "description": "Premium Vietnamese coffee roastery specializing in Arabica Cầu Đất and Robusta Lâm Đồng",
    "url": window.location.origin,
    "logo": `${window.location.origin}/logo.png`,
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
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/about/hero-coffee-farm.jpg')"
            }}
          ></div>
            <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Câu chuyện của chúng tôi
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-cream-100">
              Hành trình 25 năm mang đến cà phê đặc sản chất lượng cao
            </p>
            <Link
              to="/products"
              className="inline-block bg-brand-primary text-brand-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-primary/90 transition-colors"
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
                    Balan Coffee & Roastery được thành lập từ năm 1998 bởi ông Nguyễn Văn Minh, 
                    một người nông dân đầy đam mê với cà phê tại vùng cao nguyên Đà Lạt. 
                    Bắt đầu từ một vườn cà phê nhỏ, chúng tôi đã không ngừng phát triển 
                    để trở thành một trong những thương hiệu cà phê đặc sản hàng đầu Việt Nam.
                  </p>
                  <p className="mb-4">
                    Với hơn 25 năm kinh nghiệm, chúng tôi tự hào mang đến những sản phẩm 
                    cà phê chất lượng cao, từ khâu trồng trọt, thu hoạch, chế biến đến rang xay. 
                    Mỗi hạt cà phê đều được chăm sóc tỉ mỉ và kiểm tra chất lượng nghiêm ngặt.
                  </p>
                  <p>
                    Sứ mệnh của chúng tôi là mang đến cho người tiêu dùng những trải nghiệm 
                    cà phê tuyệt vời nhất, đồng thời góp phần phát triển bền vững ngành 
                    cà phê Việt Nam.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="/images/about/coffee-processing.jpg"
                  alt="Coffee processing"
                  className="rounded-lg shadow-xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-brand-primary text-brand-white p-6 rounded-lg">
                  <div className="text-3xl font-bold">25+</div>
                  <div className="text-sm">Năm kinh nghiệm</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-cream-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Giá trị cốt lõi
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Những giá trị định hướng mọi hoạt động của chúng tôi
              </p>
            </div><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <div key={value.title} className="text-center">
                  <div className="text-6xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Hành trình phát triển
              </h2>
              <p className="text-xl text-gray-600">
                Những cột mốc quan trọng trong lịch sử phát triển
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-brand-primary/20"></div>              {milestones.map((milestone, index) => (
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">            <div className="text-center mb-16">
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

        {/* Statistics Section */}
        <section className="py-20 bg-brand-primary text-brand-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold mb-2">25+</div>
                <div className="text-brand-white/80">Năm kinh nghiệm</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">50+</div>
                <div className="text-brand-white/80">Loại cà phê đặc sản</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">10K+</div>
                <div className="text-brand-white/80">Khách hàng hài lòng</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">100%</div>
                <div className="text-brand-white/80">Cà phê nguyên chất</div>
              </div>
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Chứng nhận chất lượng
              </h2>
              <p className="text-xl text-gray-600">
                Các chứng nhận quốc tế đảm bảo chất lượng và tính bền vững
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <img
                  src="/images/certifications/organic.png"
                  alt="Organic Certification"
                  className="h-20 mx-auto mb-4"
                />
                <h3 className="font-semibold text-gray-900">Organic</h3>
              </div>
              <div className="text-center">
                <img
                  src="/images/certifications/fair-trade.png"
                  alt="Fair Trade Certification"
                  className="h-20 mx-auto mb-4"
                />
                <h3 className="font-semibold text-gray-900">Fair Trade</h3>
              </div>
              <div className="text-center">
                <img
                  src="/images/certifications/rainforest.png"
                  alt="Rainforest Alliance"
                  className="h-20 mx-auto mb-4"
                />
                <h3 className="font-semibold text-gray-900">Rainforest Alliance</h3>
              </div>
              <div className="text-center">
                <img
                  src="/images/certifications/haccp.png"
                  alt="HACCP Certification"
                  className="h-20 mx-auto mb-4"
                />
                <h3 className="font-semibold text-gray-900">HACCP</h3>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-brand-primary text-brand-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold mb-6">
              Hãy trở thành một phần của hành trình
            </h2>
            <p className="text-xl text-brand-white/80 mb-8">
              Khám phá những dòng cà phê đặc sản được chế tác từ tâm huyết
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="inline-block bg-brand-white text-brand-primary px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Mua sắm ngay
              </Link>
              <Link
                to="/contact"
                className="inline-block border-2 border-brand-white text-brand-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-brand-white hover:text-brand-primary transition-colors"
              >
                Liên hệ
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;

