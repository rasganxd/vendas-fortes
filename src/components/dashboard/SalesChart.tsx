
import { 
  LineChart, 
  Line, 
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
  mesAtual: number;
  mesPassado: number;
}

const data: SalesData[] = [
  { name: 'Jan', mesAtual: 4200, mesPassado: 2500 },
  { name: 'Fev', mesAtual: 3000, mesPassado: 1500 },
  { name: 'Mar', mesAtual: 5100, mesPassado: 3800 },
  { name: 'Abr', mesAtual: 2800, mesPassado: 1800 },
  { name: 'Mai', mesAtual: 4000, mesPassado: 2900 },
  { name: 'Jun', mesAtual: 4800, mesPassado: 3500 },
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
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} 
              labelFormatter={(label) => `Mês: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="mesAtual" 
              name="Mês Atual" 
              stroke="#1a365d" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="mesPassado" 
              name="Mês Passado" 
              stroke="#0d9488" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
