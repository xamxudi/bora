import React from "react";
import "./Footer.css";

const Footer = () => {
  const companyInfo = {
    name: "Senden",
    industry: "Media",
    address: "123 Đường Trần Não, Phường Bình An, Quận 2, TP. Thủ Đức, TP.HCM",
    phone: "1111111111111111111111111",
    email: "info@senden.vn",
    zalo: "https://zalo.me/1111111111111111111",
    facebook: "https://facebook.com/sendenmedia"
  };

    const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1791825228206!2d106.7280009759178!3d10.797584589352525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752604b9fab359%3A0x9e574e414e169428!2zxJAuIFPhu5EgMTlCLCBBbiBLaMOhbmgsIFRo4bunIMSQ4bupYywgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1751712799910!5m2!1svi!2s";

  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Company Info */}
        <div className="company-info">
          <h3 className="company-name">{companyInfo.name}</h3>
          <p className="company-industry">{companyInfo.industry}</p>
          
          <div className="contact-info">
            <p><i className="fas fa-map-marker-alt"></i> {companyInfo.address}</p>
            <p><i className="fas fa-phone"></i> {companyInfo.phone}</p>
            <p><i className="fas fa-envelope"></i> {companyInfo.email}</p>
          </div>

          {/* Social Icons */}
          <div className="social-icons">
            <a href={companyInfo.zalo} target="_blank" rel="noopener noreferrer" className="zalo-icon">
              <img src="" alt="Zalo" />
            </a>
            <a href={companyInfo.facebook} target="_blank" rel="noopener noreferrer" className="fb-icon">
              <i className="fab fa-facebook-f"></i>
            </a>
          </div>
        </div>

        {/* Map Embed */}
        <div className="map-container">
          <iframe
            title="Senden Location"
            src={mapEmbedUrl}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      {/* Copyright */}
      <div className="copyright">
        <p>&copy; {new Date().getFullYear()} {companyInfo.name}. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;