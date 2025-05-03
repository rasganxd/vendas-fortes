import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SalesRep } from '@/types';
import { useSalesReps } from '@/hooks/useSalesReps';
import { EditSalesRepDialog } from '@/components/personnel/EditSalesRepDialog';
import { DeleteSalesRepDialog } from '@/components/personnel/DeleteSalesRepDialog';
import { Plus, Edit, Trash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const SalesRepsPage = () => {
  const { salesReps, addSalesRep, generateNextCode, isLoading, setSalesReps } = useSalesReps();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedSalesRep, setSelectedSalesRep] = useState<SalesRep | null>(null);
  const [newSalesRep, setNewSalesRep] = useState<Omit<SalesRep, 'id'>>({
    code: generateNextCode(),
    name: '',
    email: '',
    phone: '',
    document: '',
    notes: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'sales',
    active: true
  });
  
  // Initialize new sales rep with default values
  const initialSalesRep: Omit<SalesRep, 'id'> = {
    code: salesReps.length > 0 ? salesReps.reduce((max, sr) => Math.max(max, sr.code || 0), 0) + 1 : 1,
    name: '',
    email: '',
    phone: '',
    document: '',
    notes: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    role: 'sales',
    active: true
  };
  
  const handleCreate = async () => {
    try {
      await addSalesRep(newSalesRep);
      setOpenCreate(false);
      setNewSalesRep(initialSalesRep); // Reset the form
      toast({
        title: "Representante de vendas criado",
        description: "Representante de vendas criado com sucesso!",
      })
    } catch (error) {
      console.error("Error creating sales rep:", error);
      toast({
        title: "Erro ao criar representante de vendas",
        description: "Houve um problema ao criar o representante de vendas.",
        variant: "destructive",
      })
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Representantes de Vendas</h1>
        <Button onClick={() => setOpenCreate(true)} className="bg-sales-800 hover:bg-sales-700">
          <Plus size={16} className="mr-2" />
          Adicionar
        </Button>
      </div>
      
      <Table>
        <TableCaption>Lista de representantes de vendas.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Código</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salesReps.map((salesRep) => (
            <TableRow key={salesRep.id}>
              <TableCell className="font-medium">{salesRep.code}</TableCell>
              <TableCell>{salesRep.name}</TableCell>
              <TableCell>{salesRep.email}</TableCell>
              <TableCell>{salesRep.phone}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSalesRep(salesRep);
                    setOpenEdit(true);
                  }}
                >
                  <Edit size={16} className="mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSalesRep(salesRep);
                    setOpenDelete(true);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash size={16} className="mr-2" />
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {salesReps.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Nenhum representante de vendas encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Create SalesRep Dialog */}
      <EditSalesRepDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        salesRep={newSalesRep}
        setSalesRep={setNewSalesRep}
        onSave={handleCreate}
        title="Criar Representante de Vendas"
      />

      {/* Edit SalesRep Dialog */}
      {selectedSalesRep && (
        <EditSalesRepDialog
          open={openEdit}
          onOpenChange={setOpenEdit}
          salesRep={selectedSalesRep}
          setSalesRep={(updatedSalesRep) => {
            if (selectedSalesRep) {
              setSalesReps(salesReps.map(sr => sr.id === selectedSalesRep.id ? updatedSalesRep : sr));
            }
          }}
          title="Editar Representante de Vendas"
        />
      )}

      {/* Delete SalesRep Dialog */}
      {selectedSalesRep && (
        <DeleteSalesRepDialog
          open={openDelete}
          onOpenChange={setOpenDelete}
          salesRep={selectedSalesRep}
          setSalesReps={setSalesReps}
        />
      )}
    </div>
  );
};

export default SalesRepsPage;
