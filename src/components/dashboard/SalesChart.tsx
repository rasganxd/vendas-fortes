
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
  Legend 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalesData {
  name: string;
  vendas: number;
  entregas: number;
}

const data: SalesData[] = [
  { name: 'Jan', vendas: 42000, entregas: 38000 },
  { name: 'Fev', vendas: 46000, entregas: 42000 },
  { name: 'Mar', vendas: 52000, entregas: 48000 },
  { name: 'Abr', vendas: 49000, entregas: 46000 },
  { name: 'Mai', vendas: 58000, entregas: 52000 },
  { name: 'Jun', vendas: 62000, entregas: 57000 },
  { name: 'Jul', vendas: 68000, entregas: 64000 },
];

interface SalesChartProps {
  title: string;
  className?: string;
}

export default function SalesChart({ title, className }: SalesChartProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} 
              labelFormatter={(label) => `Mês: ${label}`}
            />
            <Legend />
            <Bar dataKey="vendas" name="Vendas" fill="#1a365d" />
            <Bar dataKey="entregas" name="Entregas" fill="#0d9488" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
