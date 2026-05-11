import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import "./FeatureInDevelopment.css";

export default function FeatureInDevelopment() {
  const navigate = useNavigate();

  return (
    <div className="feature-page development">
      <div className="feature-container">
        <img
          src="/bora-logo-with-text.png"
          alt="Sen Den Logo"
          className="feature-logo"
        />
        <h1 className="feature-title">Tính năng đang được phát triển</h1>
        <p className="feature-description">
          Chúng tôi đang hoàn thiện tính năng này, vui lòng quay lại sau.
        </p>
        <Button type="primary" size="large" onClick={() => navigate("/")}>
          Về trang chủ
        </Button>
      </div>
    </div>
  );
}
