
// Global state to track orders being edited
const ordersBeingEdited = new Set<string>();

export const useOrdersEditState = () => {
  const markOrderAsBeingEdited = (orderId: string) => {
    console.log("🔒 Marking order as being edited:", orderId);
    ordersBeingEdited.add(orderId);
  };

  const unmarkOrderAsBeingEdited = (orderId: string) => {
    console.log("🔓 Unmarking order as being edited:", orderId);
    ordersBeingEdited.delete(orderId);
  };

  const isOrderBeingEdited = (orderId: string) => {
    return ordersBeingEdited.has(orderId);
  };

  return {
    markOrderAsBeingEdited,
    unmarkOrderAsBeingEdited,
    isOrderBeingEdited
  };
};
