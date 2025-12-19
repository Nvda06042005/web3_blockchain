import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout";
import { ExplorePage, CampaignDetailPage, MyProjectsPage, MyNFTsPage, GamePage } from "./pages";
import { GuidePage } from "./pages/GuidePage";
import { SuccessStoriesPage } from "./pages/SuccessStoriesPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ExplorePage />} />
        <Route path="/campaign/:id" element={<CampaignDetailPage />} />
        <Route path="/my-projects" element={<MyProjectsPage />} />
        <Route path="/my-nfts" element={<MyNFTsPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/success-stories" element={<SuccessStoriesPage />} />
        <Route path="/game" element={<GamePage />} />
      </Route>
    </Routes>
  );
}

export default App;
