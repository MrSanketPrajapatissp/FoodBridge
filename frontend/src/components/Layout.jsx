import Navbar from './Navbar'
import Footer from './Footer'
export default function Layout({ children }) {
  return <div className="min-h-screen flex flex-col bg-surface"><Navbar/><main className="flex-1 pt-20">{children}</main><Footer/></div>
}
