
import React from 'react';
import OrderFormTwoColumnLayout from './OrderFormTwoColumnLayout';
import { OrderFormLayoutProps } from './types';

export default function OrderFormLayout(props: OrderFormLayoutProps) {
  // Use the new two-column layout by default
  return <OrderFormTwoColumnLayout {...props} />;
}
