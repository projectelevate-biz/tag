import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/auth'
import { db } from '@/db'
import { invoices, engagements, consultants, organizations } from '@/db/schema/rebound-relay'
import { eq } from 'drizzle-orm'

/**
 * GET /api/invoices/[id]/pdf
 * Generate PDF for an invoice
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Get invoice with related data
    const [invoice] = await db
      .select({
        id: invoices.id,
        amount: invoices.amount,
        commissionAmount: invoices.commissionAmount,
        status: invoices.status,
        createdAt: invoices.createdAt,
        engagementId: invoices.engagementId,
        title: engagements.title,
        description: engagements.description,
        clientId: engagements.clientId,
        clientName: organizations.name,
        consultantId: engagements.consultantId,
        consultantHeadline: consultants.headline,
      })
      .from(invoices)
      .innerJoin(engagements, eq(invoices.engagementId, engagements.id))
      .innerJoin(organizations, eq(engagements.clientId, organizations.id))
      .innerJoin(consultants, eq(engagements.consultantId, consultants.id))
      .where(eq(invoices.id, id))
      .limit(1)

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Verify user has access (either consultant or client)
    const consultantProfile = await db
      .select()
      .from(consultants)
      .where(eq(consultants.id, invoice.consultantId))
      .limit(1)

    if (consultantProfile[0]?.userId !== user.id && invoice.clientId !== user.id) {
      // Check if user is admin
      const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',') || []
      const isSuperAdmin = user.email && superAdminEmails.includes(user.email)
      if (!isSuperAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Generate HTML for the invoice
    const html = generateInvoiceHTML(invoice)

    // Return HTML as response (user can print to PDF from browser)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="invoice-${invoice.id}.html"`,
      },
    })
  } catch (error: any) {
    console.error('Invoice PDF generation error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}

function generateInvoiceHTML(invoice: any): string {
  const amount = (invoice.amount / 100).toFixed(2)
  const commission = invoice.commissionAmount ? (invoice.commissionAmount / 100).toFixed(2) : '0.00'
  const netEarnings = (invoice.amount - (invoice.commissionAmount || 0)) / 100
  const date = new Date(invoice.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .invoice {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #0d9488;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #0d9488;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      font-size: 32px;
      color: #333;
      margin-bottom: 5px;
    }
    .invoice-title p {
      color: #666;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      font-size: 16px;
      color: #666;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }
    .info-item {
      margin-bottom: 8px;
    }
    .info-item label {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 2px;
    }
    .info-item span {
      font-size: 14px;
      font-weight: 500;
    }
    .items {
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      overflow: hidden;
    }
    .item-row {
      display: grid;
      grid-template-columns: 1fr 150px 150px;
      padding: 15px;
      border-bottom: 1px solid #e5e5e5;
    }
    .item-row:last-child {
      border-bottom: none;
    }
    .item-header {
      background: #f9fafb;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
    }
    .item-name {
      font-weight: 500;
    }
    .totals {
      margin-top: 20px;
      margin-left: auto;
      width: 300px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e5e5;
    }
    .total-row:last-child {
      border-bottom: none;
      font-size: 18px;
      font-weight: bold;
      color: #0d9488;
    }
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status.paid { background: #dcfce7; color: #166534; }
    .status.pending { background: #fef9c3; color: #854d0e; }
    .status.failed { background: #fee2e2; color: #991b1b; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    @media print {
      body { background: white; padding: 0; }
      .invoice { box-shadow: none; padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo">Rebound & Relay</div>
      <div class="invoice-title">
        <h1>INVOICE</h1>
        <p>${invoice.id}</p>
        <p>Date: ${date}</p>
        <span class="status ${invoice.status.toLowerCase()}">${invoice.status}</span>
      </div>
    </div>

    <div class="info-grid">
      <div class="section">
        <h2>From</h2>
        <div class="info-item">
          <span>${invoice.consultantHeadline}</span>
        </div>
      </div>
      <div class="section">
        <h2>Bill To</h2>
        <div class="info-item">
          <span>${invoice.clientName}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Engagement</h2>
      <div class="info-item">
        <label>Project</label>
        <span>${invoice.title}</span>
      </div>
      <div class="info-item">
        <label>Description</label>
        <span>${invoice.description || 'N/A'}</span>
      </div>
    </div>

    <div class="items">
      <div class="item-row item-header">
        <div>Description</div>
        <div>Amount</div>
        <div>Net to Consultant</div>
      </div>
      <div class="item-row">
        <div class="item-name">${invoice.title}</div>
        <div>$${amount}</div>
        <div>$${netEarnings.toFixed(2)}</div>
      </div>
    </div>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>$${amount}</span>
      </div>
      <div class="total-row">
        <span>Platform Fee (15%)</span>
        <span>-$${commission}</span>
      </div>
      <div class="total-row">
        <span>Consultant Earnings</span>
        <span>$${netEarnings.toFixed(2)}</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>Invoice generated by Rebound & Relay - Higher Education Consultant Marketplace</p>
    </div>
  </div>

  <script>
    // Auto-print when loaded (optional, user can cancel)
    // window.print();
  </script>
</body>
</html>
  `.trim()
}
