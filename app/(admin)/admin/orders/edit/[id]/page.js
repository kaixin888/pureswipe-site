'use client';

import React from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { useUpdate } from '@refinedev/core';
import { Form, Input, Select, InputNumber, Button, message, Divider } from 'antd';
import { SendHorizonal } from 'lucide-react';

export default function OrderEdit() {
  const { formProps, saveButtonProps, queryResult } = useForm({
    resource: 'orders',
    redirect: 'list',
  });

  const { mutate: updateOrder, isLoading: isShipping } = useUpdate();
  const order = queryResult?.data?.data;

  async function handleMarkShipped() {
    const trackingNumber = formProps.form?.getFieldValue('tracking_number');
    if (!trackingNumber) {
      message.error('Please enter a tracking number first');
      return;
    }
    const shippedAt = new Date().toISOString();

    updateOrder(
      {
        resource: 'orders',
        id: order?.id,
        values: { status: 'Shipped', tracking_number: trackingNumber, shipped_at: shippedAt },
      },
      {
        onSuccess: async () => {
          // Send shipping notification email via Resend
          if (order?.email) {
            try {
              await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'shipping_notification',
                  email: order.email,
                  orderData: {
                    order_id: order.order_id,
                    customer_name: order.customer_name,
                    product_name: order.product_name,
                    amount: order.amount,
                    tracking_number: trackingNumber,
                  },
                }),
              });
              message.success('Order marked as shipped & notification email sent!');
            } catch {
              message.warning('Marked as shipped, but email sending failed');
            }
          } else {
            message.success('Order marked as shipped!');
          }
        },
        onError: () => message.error('Failed to update order'),
      }
    );
  }

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Order ID" name="order_id">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Customer Name" name="customer_name">
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input />
        </Form.Item>
        <Form.Item label="Phone" name="phone">
          <Input />
        </Form.Item>
        <Form.Item label="Status" name="status">
          <Select
            options={[
              { label: 'Paid', value: 'Paid' },
              { label: 'Processing', value: 'Processing' },
              { label: 'Shipped', value: 'Shipped' },
              { label: 'Delivered', value: 'Delivered' },
              { label: 'Cancelled', value: 'Cancelled' },
            ]}
          />
        </Form.Item>
        <Form.Item label="Tracking Number" name="tracking_number">
          <Input placeholder="Enter carrier tracking number" />
        </Form.Item>
        <Form.Item label="Amount" name="amount">
          <InputNumber prefix="$" />
        </Form.Item>
        <Form.Item label="Shipping Address" name="shipping_address">
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="City" name="shipping_city">
          <Input />
        </Form.Item>
        <Form.Item label="State" name="shipping_state">
          <Input />
        </Form.Item>
        <Form.Item label="Zip Code" name="shipping_zip">
          <Input />
        </Form.Item>

        <Divider />

        {/* Mark as Shipped — sends Resend email automatically */}
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 16 }}>
          <p style={{ fontWeight: 700, margin: '0 0 8px', color: '#0369a1' }}>
            Mark as Shipped
          </p>
          <p style={{ fontSize: 13, color: '#0284c7', margin: '0 0 12px' }}>
            Enter a tracking number above, then click below. Status will change to "Shipped" and a notification email will be sent to the customer automatically.
          </p>
          <Button
            type="primary"
            icon={<SendHorizonal size={14} />}
            loading={isShipping}
            onClick={handleMarkShipped}
            style={{ background: '#0284c7' }}
          >
            Mark Shipped & Send Email
          </Button>
        </div>
      </Form>
    </Edit>
  );
}
