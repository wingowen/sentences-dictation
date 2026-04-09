import * as LucideIcons from 'lucide-react';

const Icon = ({ name, size = 24, color = 'currentColor', className = '' }) => {
  const IconComponent = LucideIcons[name];
  
  if (!IconComponent) {
    return null;
  }
  
  return (
    <IconComponent 
      size={size} 
      color={color} 
      className={className} 
    />
  );
};

export default Icon;