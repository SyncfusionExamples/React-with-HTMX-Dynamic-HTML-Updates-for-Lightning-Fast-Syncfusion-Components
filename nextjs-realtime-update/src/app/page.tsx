'use client';

import { useEffect } from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective } from "@syncfusion/ej2-react-grids";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    htmx?: any;
  }
}

const data = Array.from({ length: 10 }, (_, i) => ({
  OrderID: 1000 + i + 1,
  CustomerID: ['ALFKI', 'ANANTR', 'ANTON', 'BLONP', 'BOLID'][Math.floor(Math.random() * 5)],
  Freight: (2.1 * (i + 1)).toFixed(2),
}));

export default function Home() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.htmx) {
      const container = document.querySelector('#htmx-container');
      if (container) {
        console.log('Initializing HTMX on #htmx-container');
        window.htmx.process(container);
      } else {
        console.error('HTMX container not found');
      }

      // Observe DOM changes for grid rendering
      const observer = new MutationObserver(() => {
        console.log('DOM changed, reprocessing HTMX');
        if (container) {
          window.htmx.process(container);
        }
      });
      observer.observe(document.querySelector('#htmx-container') || document.body, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    } else {
      console.error('HTMX not loaded');
    }
  }, []);

  return (
    <div id="htmx-container" data-hx-preserve className="p-4">
      <GridComponent className="e-custom-control" dataSource={data}
          rowDataBound={(args) => {
            if (window.htmx) {
              console.log('Processing HTMX for row:', args.data.OrderID);
              window.htmx.process(args.row);
            }
          }}
      >
        <ColumnsDirective>
          <ColumnDirective field="OrderID" headerText="Order ID" width="60" textAlign="Right" />
          <ColumnDirective field="CustomerID" headerText="Customer Name" width="60" />
          <ColumnDirective field="Freight" headerText="Freight" width="60" format="C2" textAlign="Right"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
            template={(props: any) => (
              <div
                data-hx-sse={`connect:/api/updates?orderID=${props.OrderID} swap:freight-updated`}
                data-hx-target="this"
                data-hx-swap="innerHTML"
                className="p-1"
              >
                ${props.Freight}
              </div>
            )}
          />
        </ColumnsDirective>
      </GridComponent>
    </div>
  );
}