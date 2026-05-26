import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthLayout } from "./components/AuthLayout";
import { ProtectedRoute, PublicRoute } from "./components/RouteGuards";
import { DashboardPage } from "./pages/DashboardPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { CustomersPage } from "./pages/CustomersPage";
import { CustomerEditPage } from "./pages/CustomerEditPage";
import { BusinessPage } from "./pages/BusinessPage";
import { BusinessEditPage } from "./pages/BusinessEditPage";
import { ReceiptPage } from "./pages/ReceiptPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id/edit" element={<CustomerEditPage />} />
            <Route path="/business" element={<BusinessPage />} />
            <Route path="/businesses/:id/edit" element={<BusinessEditPage />} />
            <Route path="/receipts" element={<ReceiptPage />} />
          </Route>
        </Route>
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
