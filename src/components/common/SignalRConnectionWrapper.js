
import { SignalRProvider } from "../../contexts/SignalRContext";
import { useAuth } from "../../contexts/AuthContext"; 

const signalRHubUrl = (process.env.REACT_APP_NOTIFICATION_URL || "http://localhost:5000") + "/hubs/notifications";
const SignalRConnectionWrapper = ({ children }) => {
  const { token } = useAuth(); // Lấy token từ AuthContext

  // `SignalRProvider` sẽ tự động kết nối khi `accessToken` thay đổi (từ null/undefined sang giá trị)
  // và ngắt kết nối/kết nối lại nếu `accessToken` thay đổi sau đó.
  return (
    <SignalRProvider hubUrl={signalRHubUrl} accessToken={token}>
      {children}
    </SignalRProvider>
  );
};

export default SignalRConnectionWrapper;