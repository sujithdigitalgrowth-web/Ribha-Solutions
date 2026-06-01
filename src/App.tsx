import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Layout } from './components/Layout';
import { RoleGuard } from './components/RoleGuard';
import { Home } from './pages/Home';
import { FindTalent } from './pages/FindTalent';
import { FreelancerProfile } from './pages/FreelancerProfile';
import { InviteToJob } from './pages/InviteToJob';
import { FindWork } from './pages/FindWork';
import { ApplyJob } from './pages/ApplyJob';
import { PostJob } from './pages/PostJob';
import { Dashboard } from './pages/Dashboard';
import { Messages } from './pages/Messages';
import { Notifications } from './pages/Notifications';
import { EditProfile } from './pages/EditProfile';
import { SavedJobs } from './pages/SavedJobs';
import { JobTemplates } from './pages/JobTemplates';
import { FAQ } from './pages/FAQ';
import { MyJobs } from './pages/MyJobs';
import { JobDetail } from './pages/JobDetail';
import { JobView } from './pages/JobView';
import { ContractDetail } from './pages/ContractDetail';
import { EditJob } from './pages/EditJob';
import { HowItWorks } from './pages/HowItWorks';
import { Pricing } from './pages/Pricing';
import { About } from './pages/About';
import { Help } from './pages/Help';
import { Blog } from './pages/Blog';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { ContactSupport } from './pages/ContactSupport';
import { AdminDashboard } from './pages/AdminDashboard';
import { JobAlerts } from './pages/JobAlerts';
import { ProposalTemplates } from './pages/ProposalTemplates';
import { TalentShortlist } from './pages/TalentShortlist';
import { ApplicationHistory } from './pages/ApplicationHistory';
import { SuccessStories } from './pages/SuccessStories';
import { Invoices } from './pages/Invoices';
import { Referrals } from './pages/Referrals';
import { NotificationSettings } from './pages/NotificationSettings';
import { CompareJobs } from './pages/CompareJobs';
import { CompareFreelancers } from './pages/CompareFreelancers';
import { ManagePortfolio } from './pages/ManagePortfolio';
import { ExportData } from './pages/ExportData';
import { SignUp } from './pages/SignUp';
import { LogIn } from './pages/LogIn';
import { SavedSearches } from './pages/SavedSearches';
import { ClientCompanyProfile } from './pages/ClientCompanyProfile';
import { Analytics } from './pages/Analytics';
import { Wallet } from './pages/Wallet';
import { PaymentMethods } from './pages/PaymentMethods';
import { FavoriteFreelancers } from './pages/FavoriteFreelancers';
import { NDATemplates } from './pages/NDATemplates';
import { TakeExam } from './pages/TakeExam';
import { FreelancerOnboarding } from './pages/FreelancerOnboarding';
import { AppInitializer } from './components/AppInitializer';
import { SyncFreelancerExamAttempts } from './components/SyncFreelancerExamAttempts';
import { SyncDynamicDataOnAuth } from './components/SyncDynamicDataOnAuth';

function App() {
  return (
    <AppInitializer>
    <BrowserRouter>
      <ThemeProvider>
      <ToastProvider>
      <AuthProvider>
        <SyncFreelancerExamAttempts />
        <SyncDynamicDataOnAuth />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="find-talent" element={<RoleGuard allowRole="client"><FindTalent /></RoleGuard>} />
            <Route path="freelancer/:id" element={<FreelancerProfile />} />
            <Route path="freelancer/:id/invite" element={<RoleGuard allowRole="client" requireAuth><InviteToJob /></RoleGuard>} />
            <Route path="post-job" element={<RoleGuard allowRole="client" requireAuth><PostJob /></RoleGuard>} />
            <Route path="my-jobs" element={<RoleGuard allowRole="client" requireAuth><MyJobs /></RoleGuard>} />
            <Route path="my-jobs/:id" element={<RoleGuard allowRole="client" requireAuth><JobDetail /></RoleGuard>} />
            <Route path="my-jobs/:id/edit" element={<RoleGuard allowRole="client" requireAuth><EditJob /></RoleGuard>} />
            <Route path="contract/:id" element={<ContractDetail />} />
            <Route path="find-work" element={<RoleGuard allowRole="freelancer" requireAuth><FindWork /></RoleGuard>} />
            <Route path="job/:id" element={<JobView />} />
            <Route path="apply/:id" element={<ApplyJob />} />
            <Route path="messages" element={<Messages />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile/edit" element={<RoleGuard allowRole="freelancer" requireAuth><EditProfile /></RoleGuard>} />
            <Route path="saved-jobs" element={<RoleGuard allowRole="freelancer" requireAuth><SavedJobs /></RoleGuard>} />
            <Route path="job-alerts" element={<RoleGuard allowRole="freelancer" requireAuth><JobAlerts /></RoleGuard>} />
            <Route path="saved-searches" element={<RoleGuard allowRole="freelancer" requireAuth><SavedSearches /></RoleGuard>} />
            <Route path="proposal-templates" element={<RoleGuard allowRole="freelancer" requireAuth><ProposalTemplates /></RoleGuard>} />
            <Route path="application-history" element={<RoleGuard allowRole="freelancer" requireAuth><ApplicationHistory /></RoleGuard>} />
            <Route path="talent-shortlist" element={<RoleGuard allowRole="client" requireAuth><TalentShortlist /></RoleGuard>} />
            <Route path="favorites" element={<RoleGuard allowRole="client" requireAuth><FavoriteFreelancers /></RoleGuard>} />
            <Route path="company-profile" element={<RoleGuard allowRole="client" requireAuth><ClientCompanyProfile /></RoleGuard>} />
            <Route path="success-stories" element={<SuccessStories />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="payment-methods" element={<PaymentMethods />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="notification-settings" element={<NotificationSettings />} />
            <Route path="compare-jobs" element={<CompareJobs />} />
            <Route path="compare-freelancers" element={<CompareFreelancers />} />
            <Route path="portfolio" element={<RoleGuard allowRole="freelancer" requireAuth><ManagePortfolio /></RoleGuard>} />
            <Route path="job-templates" element={<RoleGuard allowRole="client" requireAuth><JobTemplates /></RoleGuard>} />
            <Route path="nda-templates" element={<NDATemplates />} />
            <Route path="faq" element={<FAQ />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="about" element={<About />} />
          <Route path="help" element={<Help />} />
          <Route path="contact-support" element={<ContactSupport />} />
          <Route path="blog" element={<Blog />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="export" element={<ExportData />} />
          <Route path="analytics" element={<Analytics />} />
<Route path="signup" element={<SignUp />} />
            <Route path="login" element={<LogIn />} />
            <Route path="take-exam" element={<TakeExam />} />
            <Route path="freelancer-onboarding" element={<FreelancerOnboarding />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AuthProvider>
      </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
    </AppInitializer>
  );
}

export default App;
