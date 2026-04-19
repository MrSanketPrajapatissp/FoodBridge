export default function EmptyState({ icon:Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-up">
      <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mb-6"><Icon size={36} strokeWidth={1.5} className="text-primary"/></div>
      <h3 className="font-heading font-bold text-xl text-text-primary mb-2">{title}</h3>
      <p className="font-body text-text-secondary mb-8 max-w-sm">{message}</p>
      {action}
    </div>
  )
}
