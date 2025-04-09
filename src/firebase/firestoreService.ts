import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp
} from "firebase/firestore";
import { db } from "./config";
import { 
  Customer, 
  Product, 
  Order, 
  Payment, 
  DeliveryRoute, 
  Load, 
  SalesRep, 
  Vehicle,
  PaymentTable
} from "@/types";

// Converte timestamp do Firestore para Date
const convertTimestampToDate = (data: any) => {
  const newData = { ...data };
  
  // Verifica se há timestamps e converte para Date
  Object.keys(newData).forEach(key => {
    if (newData[key] instanceof Timestamp) {
      newData[key] = newData[key].toDate();
    }
  });
  
  return newData;
};

// Serviço para Customers
export const customerService = {
  async getAll(): Promise<Customer[]> {
    const customersRef = collection(db, "customers");
    const snapshot = await getDocs(customersRef);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestampToDate(doc.data()) 
    } as Customer));
  },
  
  async add(customer: Omit<Customer, "id">): Promise<string> {
    const customerData = {
      ...customer,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "customers"), customerData);
    return docRef.id;
  },
  
  async update(id: string, customer: Partial<Customer>): Promise<void> {
    const customerRef = doc(db, "customers", id);
    await updateDoc(customerRef, customer);
  },
  
  async delete(id: string): Promise<void> {
    const customerRef = doc(db, "customers", id);
    await deleteDoc(customerRef);
  }
};

// Serviço para Products
export const productService = {
  async getAll(): Promise<Product[]> {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Product));
  },
  
  async add(product: Omit<Product, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "products"), product);
    return docRef.id;
  },
  
  async update(id: string, product: Partial<Product>): Promise<void> {
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, product);
  },
  
  async delete(id: string): Promise<void> {
    const productRef = doc(db, "products", id);
    await deleteDoc(productRef);
  }
};

// Serviço para Orders
export const orderService = {
  async getAll(): Promise<Order[]> {
    const ordersRef = collection(db, "orders");
    const snapshot = await getDocs(ordersRef);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestampToDate(doc.data()) 
    } as Order));
  },
  
  async add(order: Omit<Order, "id">): Promise<string> {
    const orderData = {
      ...order,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "orders"), orderData);
    return docRef.id;
  },
  
  async update(id: string, order: Partial<Order>): Promise<void> {
    const orderRef = doc(db, "orders", id);
    await updateDoc(orderRef, order);
  },
  
  async delete(id: string): Promise<void> {
    const orderRef = doc(db, "orders", id);
    await deleteDoc(orderRef);
  }
};

// Serviço para Veículos
export const vehicleService = {
  async getAll(): Promise<Vehicle[]> {
    const vehiclesRef = collection(db, "vehicles");
    const snapshot = await getDocs(vehiclesRef);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestampToDate(doc.data()) 
    } as Vehicle));
  },
  
  async add(vehicle: Omit<Vehicle, "id">): Promise<string> {
    const vehicleData = {
      ...vehicle,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "vehicles"), vehicleData);
    return docRef.id;
  },
  
  async update(id: string, vehicle: Partial<Vehicle>): Promise<void> {
    const vehicleRef = doc(db, "vehicles", id);
    await updateDoc(vehicleRef, vehicle);
  },
  
  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error("ID do veículo é obrigatório para exclusão");
    }
    console.log("Tentando excluir veículo com ID:", id);
    const vehicleRef = doc(db, "vehicles", id);
    await deleteDoc(vehicleRef);
    console.log("Veículo excluído do Firestore com ID:", id);
  }
};

// Serviço para Pagamentos
export const paymentService = {
  async getAll(): Promise<Payment[]> {
    const paymentsRef = collection(db, "payments");
    const snapshot = await getDocs(paymentsRef);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestampToDate(doc.data()) 
    } as Payment));
  },
  
  async add(payment: Omit<Payment, "id">): Promise<string> {
    const paymentData = {
      ...payment,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "payments"), paymentData);
    return docRef.id;
  },
  
  async update(id: string, payment: Partial<Payment>): Promise<void> {
    const paymentRef = doc(db, "payments", id);
    await updateDoc(paymentRef, payment);
  },
  
  async delete(id: string): Promise<void> {
    const paymentRef = doc(db, "payments", id);
    await deleteDoc(paymentRef);
  }
};

// Serviço para Representantes de Vendas
export const salesRepService = {
  async getAll(): Promise<SalesRep[]> {
    const salesRepsRef = collection(db, "salesReps");
    const snapshot = await getDocs(salesRepsRef);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as SalesRep));
  },
  
  async add(salesRep: Omit<SalesRep, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "salesReps"), salesRep);
    return docRef.id;
  },
  
  async update(id: string, salesRep: Partial<SalesRep>): Promise<void> {
    const salesRepRef = doc(db, "salesReps", id);
    await updateDoc(salesRepRef, salesRep);
  },
  
  async delete(id: string): Promise<void> {
    const salesRepRef = doc(db, "salesReps", id);
    await deleteDoc(salesRepRef);
  }
};

// Serviço para Rotas
export const routeService = {
  async getAll(): Promise<DeliveryRoute[]> {
    const routesRef = collection(db, "routes");
    const snapshot = await getDocs(routesRef);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestampToDate(doc.data()) 
    } as DeliveryRoute));
  },
  
  async add(route: Omit<DeliveryRoute, "id">): Promise<string> {
    const routeData = {
      ...route,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "routes"), routeData);
    return docRef.id;
  },
  
  async update(id: string, route: Partial<DeliveryRoute>): Promise<void> {
    const routeRef = doc(db, "routes", id);
    await updateDoc(routeRef, route);
  },
  
  async delete(id: string): Promise<void> {
    if (!id) {
      throw new Error("ID da rota é obrigatório para exclusão");
    }
    console.log("Tentando excluir rota com ID:", id);
    const routeRef = doc(db, "routes", id);
    await deleteDoc(routeRef);
    console.log("Documento excluído do Firestore com ID:", id);
  }
};

// Serviço para Carregamentos
export const loadService = {
  async getAll(): Promise<Load[]> {
    const loadsRef = collection(db, "loads");
    const snapshot = await getDocs(loadsRef);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestampToDate(doc.data()) 
    } as Load));
  },
  
  async add(load: Omit<Load, "id">): Promise<string> {
    const loadData = {
      ...load,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "loads"), loadData);
    return docRef.id;
  },
  
  async update(id: string, load: Partial<Load>): Promise<void> {
    const loadRef = doc(db, "loads", id);
    await updateDoc(loadRef, load);
  },
  
  async delete(id: string): Promise<void> {
    const loadRef = doc(db, "loads", id);
    await deleteDoc(loadRef);
  }
};

// Serviço para Tabelas de Pagamento
export const paymentTableService = {
  async getAll(): Promise<PaymentTable[]> {
    const paymentTablesRef = collection(db, "paymentTables");
    const snapshot = await getDocs(paymentTablesRef);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestampToDate(doc.data()) 
    } as PaymentTable));
  },
  
  async add(paymentTable: Omit<PaymentTable, "id">): Promise<string> {
    const paymentTableData = {
      ...paymentTable,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, "paymentTables"), paymentTableData);
    return docRef.id;
  },
  
  async update(id: string, paymentTable: Partial<PaymentTable>): Promise<void> {
    const updateData = {
      ...paymentTable,
      updatedAt: serverTimestamp()
    };
    const paymentTableRef = doc(db, "paymentTables", id);
    await updateDoc(paymentTableRef, updateData);
  },
  
  async delete(id: string): Promise<void> {
    const paymentTableRef = doc(db, "paymentTables", id);
    await deleteDoc(paymentTableRef);
  }
};
