import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import PageLayout from '@/components/layout/PageLayout';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState(customers);

  useEffect(() => {
    setFilteredCustomers(
      customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [customers, searchQuery]);

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const handleDelete = (customer) => {
    deleteCustomer(customer.id);
    toast({
      title: "Cliente removido",
      description: "O cliente foi removido com sucesso."
    });
  };

  return (
    <PageLayout title="Clientes">
      <div className="mb-4 flex justify-between items-center">
        <Input
          type="text"
          placeholder="Buscar cliente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Cliente</DialogTitle>
              <DialogDescription>
                Adicione um novo cliente ao sistema.
              </DialogDescription>
            </DialogHeader>
            <AddCustomerForm
              onSubmit={(data) => {
                addCustomer({
                  ...data,
                  createdAt: new Date().toISOString()
                });
                setShowAddModal(false);
                toast({
                  title: "Cliente adicionado",
                  description: "O cliente foi adicionado com sucesso."
                });
              }}
              onCancel={() => setShowAddModal(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableCaption>Uma lista de todos os seus clientes.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCustomers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(customer)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(customer)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deletar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>
              Total de clientes: {filteredCustomers.length}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Editar Cliente
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Edite os detalhes do cliente.
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <EditCustomerForm
              customer={selectedCustomer}
              onSubmit={(data) => {
                updateCustomer({ ...selectedCustomer, ...data });
                setShowEditModal(false);
                toast({
                  title: "Cliente atualizado",
                  description: "O cliente foi atualizado com sucesso."
                });
              }}
              onCancel={() => setShowEditModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

function AddCustomerForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, email, phone });
    setName('');
    setEmail('');
    setPhone('');
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button type="submit">Adicionar</Button>
      </DialogFooter>
    </form>
  );
}

function EditCustomerForm({ customer, onSubmit, onCancel }) {
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email);
  const [phone, setPhone] = useState(customer.phone);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, email, phone });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  );
}
