import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { RequestModalProvider } from './context/RequestModalContext'
import LoginPage from './pages/LoginPage'
import CreateRequestPage from './pages/CreateRequestPage'
import DashboardPage from './pages/DashboardPage'
import EditRequestPage from './pages/EditRequestPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import UsersPage from './pages/UsersPage'
import ApprovalGroupsPage from './pages/ApprovalGroupsPage'
import AppLayout from './components/layout/AppLayout'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

import PrintRequestPage from './pages/PrintRequestPage'
import PurchaseOrderPage from './pages/PurchaseOrderPage'
import ProfilePage from './pages/ProfilePage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import OrganizationPage from './pages/admin/OrganizationPage'
import AnalyticalSettingsPage from './pages/admin/AnalyticalSettingsPage'

const PrivateRoute = ({ children, allowedRoles, noLayout }: { children: ReactNode, allowedRoles?: string[], noLayout?: boolean }) => {
  const { isAuthenticated, loading, user } = useAuth()
  
  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
            <svg className="h-10 w-10 animate-spin text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium text-slate-500">Chargement de l'application...</span>
        </div>
    </div>
  )
  
  if (!isAuthenticated) return <Navigate to="/login" />

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      if (user.role === 'ADMIN') return <Navigate to="/admin" />
      return <Navigate to="/" />
  }

  if (noLayout) return <>{children}</>

  return (
    <AppLayout>
        {children}
    </AppLayout>
  )
}



function App() {
  return (
    <AuthProvider>
        <NotificationProvider>
            <RequestModalProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        
                        {/* Print Route (No Layout) */}
                        <Route path="/print-request/:id" element={
                            <PrivateRoute noLayout>
                                <PrintRequestPage />
                            </PrivateRoute>
                        } />
                        
                        <Route path="/purchase-order/:id" element={
                            <PrivateRoute noLayout>
                                <PurchaseOrderPage />
                            </PrivateRoute>
                        } />
                        
                        {/* Admin Routes */}
                        <Route path="/admin" element={
                            <PrivateRoute allowedRoles={['ADMIN']}>
                                <AdminDashboardPage />
                            </PrivateRoute>
                        } />
                        <Route path="/admin/users" element={
                            <PrivateRoute allowedRoles={['ADMIN']}>
                                <UsersPage />
                            </PrivateRoute>
                        } />
                        <Route path="/admin/groups" element={
                            <PrivateRoute allowedRoles={['ADMIN']}>
                                <ApprovalGroupsPage />
                            </PrivateRoute>
                        } />
                        <Route path="/admin/analytics" element={
                            <PrivateRoute allowedRoles={['ADMIN']}>
                                <AnalyticsPage />
                            </PrivateRoute>
                        } />
                        <Route path="/admin/organization" element={
                            <PrivateRoute allowedRoles={['ADMIN']}>
                                <OrganizationPage />
                            </PrivateRoute>
                        } />
                        <Route path="/admin/analytical-settings" element={
                            <PrivateRoute allowedRoles={['ADMIN']}>
                                <AnalyticalSettingsPage />
                            </PrivateRoute>
                        } />
                        
                        <Route path="/profile" element={
                            <PrivateRoute>
                                <ProfilePage />
                            </PrivateRoute>
                        } />

                        {/* Operational Routes (All staff except ADMIN) */}
                        <Route path="/create-request" element={
                            <PrivateRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'BUYER', 'ACCOUNTANT']}>
                                <CreateRequestPage />
                            </PrivateRoute>
                        } />
                        <Route path="/edit-request/:id" element={
                            <PrivateRoute allowedRoles={['EMPLOYEE', 'MANAGER', 'BUYER', 'ACCOUNTANT']}>
                                <EditRequestPage />
                            </PrivateRoute>
                        } />

                        <Route path="/" element={
                            <PrivateRoute>
                                <DashboardDispatcher />
                            </PrivateRoute>
                        } />
                    </Routes>
                </BrowserRouter>
            </RequestModalProvider>
        </NotificationProvider>
    </AuthProvider>
  )
}

// Helper to dispatch based on role at root path
const DashboardDispatcher = () => {
    const { user } = useAuth()
    if (user?.role === 'ADMIN') return <Navigate to="/admin" />
    return <DashboardPage />
}

export default App
