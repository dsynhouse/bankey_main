
import React from 'react';
import { Category } from '../types';
import {
  Utensils,
  Car,
  Ticket,
  ShoppingBag,
  Zap,
  TrendingUp,
  Briefcase,
  Wallet,
  CircleHelp,
  LucideIcon
} from 'lucide-react';

interface CategoryIconProps {
  category: Category;
  className?: string;
}

const ICON_MAP: Record<Category, LucideIcon> = {
  [Category.FOOD]: Utensils,
  [Category.TRANSPORT]: Car,
  [Category.LEISURE]: Ticket,
  [Category.SHOPPING]: ShoppingBag,
  [Category.BILLS]: Zap,
  [Category.INVESTMENT]: TrendingUp,
  [Category.BUSINESS]: Briefcase,
  [Category.INCOME]: Wallet,
  [Category.OTHER]: CircleHelp
};

const CategoryIcon: React.FC<CategoryIconProps> = React.memo(({ category, className = "w-5 h-5" }) => {
  const Icon = ICON_MAP[category] || CircleHelp;
  return <Icon className={className} />;
});

export default CategoryIcon;
