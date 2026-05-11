import React from "react";
import { Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./main.css";

import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import PrivateRoute from './components/common/PrivateRoute';
import SignalRConnectionWrapper from './components/common/SignalRConnectionWrapper';

import GlobalLoading from "./components/ui/GlobalLoading";
import { UIModeProvider } from './contexts/UIModeContext';
const Home = React.lazy(() => import("./pages/Home/Home"));
const Login = React.lazy(() => import("./pages/Login/Login"));

const View = React.lazy(() => import("./components/layout/View"));
const FeatureInDevelopment = React.lazy(() => import("./pages/FeatureInDevelopment"));
const ModelTrainingDashboard = React.lazy(() => import("./pages/CreateTrain/ModelTrainingDashboard"));

// Import các layout components mới
const ImageGenerationLayout = React.lazy(() => import("./pages/CreateImage/ImageGenerationLayout"));
const VideoGenerationLayout = React.lazy(() => import("./pages/CreateVideo/VideoGenerationLayout"));

const GalleryPage = React.lazy(() => import("./pages/Gallery/GalleryPage"));
const ImageDetailPage = React.lazy(() => import("./pages/Gallery/ImageDetailPage"));
const ChatContainer = React.lazy(() => import("./pages/ChatInterface/index"));
const Translation = React.lazy(() => import("./pages/TranslationApp/TranslationApp"));
const GenerationPanelMusic = React.lazy(() => import("./pages/CreateMusic/MusicGenerator"));

const Profile = React.lazy(() => import("./pages/Profile/Profile"));
const AccountSettings = React.lazy(() => import("./pages/Profile/AccountSettings"));

function AppContent() {

  return (
    <React.Suspense fallback={<GlobalLoading message="bora..." />}>
      <Routes>
        <Route
          path="/generate/image"
          element={
            <PrivateRoute>
              <ImageGenerationLayout />
            </PrivateRoute>
          }
        />

        <Route
          path="/generate/video"
          element={
            <PrivateRoute>
              <VideoGenerationLayout />
            </PrivateRoute>
          }
        />

        {/* Các routes khác giữ nguyên */}
        <Route
          path="/GenerativeAIChat"
          element={
            <PrivateRoute>
              <ChatContainer />
            </PrivateRoute>
          }
        />
        <Route path="/GenerativeAIChat/:chatId"
          element={
            <PrivateRoute>
              <ChatContainer />
            </PrivateRoute>
          } 
        />
        <Route
          path="/Translation"
          element={
            <PrivateRoute>
              <View>
                <Translation />
              </View>
            </PrivateRoute>
          }
        />
            <Route
            path="generate/music"
            element={
              <div>
                <View  >
                  <GenerationPanelMusic />
                </View>
              </div>
            }
            
          />

        <Route
          path="/model-training"
          element={
            <div className="model-training-page">
              <View>
                <ModelTrainingDashboard />
              </View>
            </div>
          }
        />

        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/detail/:id" element={<ImageDetailPage />} />
        <Route path="/login" element={<div><Login /></div>} />
        <Route path="/coming-soon"
          element={
            <View>
              <FeatureInDevelopment />
            </View>
          }
        />
        <Route path="/profile"
          element={
            <PrivateRoute>
              <View>
                <Profile />
              </View>
            </PrivateRoute>
          }
        />
        <Route path="/user/settings"
          element={
            <PrivateRoute>
              <View>
                <AccountSettings />
              </View>
            </PrivateRoute>
          }
        />
      </Routes>
    </React.Suspense>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UIModeProvider>
          <SignalRConnectionWrapper>
            <AppContent />
          </SignalRConnectionWrapper>
        </UIModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}