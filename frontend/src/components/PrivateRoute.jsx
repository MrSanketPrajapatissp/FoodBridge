import { Navigate } from 'react-router-dom'
export default function PrivateRoute({ children, allowedRoles=[] }) {
  const token = localStorage.getItem('access_token')
  const role  = localStorage.getItem('user_role')
  if(!token) return <Navigate to="/login" replace/>
  if(allowedRoles.length>0 && !allowedRoles.includes(role)) return <Navigate to="/profile" replace/>
  return children
}
