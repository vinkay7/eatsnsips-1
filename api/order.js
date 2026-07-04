const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            name, phone, whatsapp, email,
            orderType, category, item, quantity,
            specialDescription, specialDate,
            deliveryOption, deliveryAddress, deliveryTime,
            notes
        } = req.body;

        // Validation
        if (!name || !phone || !email || !orderType || !category || !item || !quantity || !deliveryOption) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Configure transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const orderTime = new Date().toLocaleString('en-NG', {
            timeZone: 'Africa/Lagos',
            dateStyle: 'full',
            timeStyle: 'short'
        });

        const customerWhatsapp = whatsapp || phone;

        // Build conditional sections for host email
        let specialSection = '';
        if (orderType === 'Special' || orderType === 'Event') {
            specialSection = `
                <tr>
                    <td style="padding:20px 30px 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fefce8;border-radius:12px;border:1px solid #fde047;">
                            <tr>
                                <td style="padding:20px;">
                                    <h2 style="margin:0 0 12px;color:#854d0e;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">✨ Special Request</h2>
                                    <p style="margin:0;color:#292524;font-size:14px;line-height:1.6;">${specialDescription || 'No details provided'}</p>
                                    ${specialDate ? `<p style="margin:8px 0 0;color:#78716c;font-size:13px;">📅 Requested for: <strong>${new Date(specialDate).toLocaleString()}</strong></p>` : ''}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>`;
        }

        let deliveryDetails = '';
        if (deliveryOption === 'Delivery') {
            deliveryDetails = `
                <tr><td style="color:#6b7280;font-size:13px;">Address</td><td style="color:#111827;font-size:14px;font-weight:600;">${deliveryAddress}</td></tr>
                <tr><td style="color:#6b7280;font-size:13px;">Time</td><td style="color:#111827;font-size:14px;font-weight:600;">${deliveryTime || 'ASAP'}</td></tr>`;
        }

        let notesSection = '';
        if (notes) {
            notesSection = `
                <tr>
                    <td style="padding:20px 30px 0;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-radius:12px;border:1px solid #ddd6fe;">
                            <tr>
                                <td style="padding:20px;">
                                    <h2 style="margin:0 0 8px;color:#5b21b6;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">📝 Additional Notes</h2>
                                    <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${notes}</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>`;
        }

        // Read and populate host email template
        const hostTemplatePath = path.join(__dirname, '..', 'host_order_email.html');
        let hostHtml = fs.readFileSync(hostTemplatePath, 'utf8');
        hostHtml = hostHtml
            .replace('{{ORDER_TIME}}', orderTime)
            .replace('{{CUSTOMER_NAME}}', name)
            .replace('{{CUSTOMER_PHONE}}', phone)
            .replace('{{CUSTOMER_WHATSAPP}}', customerWhatsapp)
            .replace('{{CUSTOMER_EMAIL}}', email)
            .replace('{{ORDER_TYPE}}', orderType)
            .replace('{{ORDER_CATEGORY}}', category)
            .replace('{{ORDER_ITEM}}', item)
            .replace('{{ORDER_QUANTITY}}', quantity)
            .replace('{{DELIVERY_OPTION}}', deliveryOption)
            .replace('{{SPECIAL_SECTION}}', specialSection)
            .replace('{{DELIVERY_DETAILS}}', deliveryDetails)
            .replace('{{NOTES_SECTION}}', notesSection);

        // Build visitor email
        const visitorTemplatePath = path.join(__dirname, '..', 'visitor_order_email.html');
        let visitorHtml = fs.readFileSync(visitorTemplatePath, 'utf8');

        let visitorDeliverySection = '';
        if (deliveryOption === 'Delivery') {
            visitorDeliverySection = `
                <tr>
                    <td style="padding:0 30px 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe;">
                            <tr>
                                <td style="padding:16px 20px;">
                                    <p style="margin:0;color:#1e40af;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">🚗 Delivery To:</p>
                                    <p style="margin:8px 0 0;color:#1f2937;font-size:14px;line-height:1.5;">${deliveryAddress}</p>
                                    ${deliveryTime ? `<p style="margin:4px 0 0;color:#6b7280;font-size:13px;">⏰ ${deliveryTime}</p>` : ''}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>`;
        }

        let visitorSpecialSection = '';
        if (orderType === 'Special' || orderType === 'Event') {
            visitorSpecialSection = `
                <tr>
                    <td style="padding:0 30px 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fefce8;border-radius:12px;border:1px solid #fde047;">
                            <tr>
                                <td style="padding:16px 20px;">
                                    <p style="margin:0;color:#854d0e;font-size:12px;font-weight:700;">✨ Your Special Request:</p>
                                    <p style="margin:8px 0 0;color:#374151;font-size:13px;line-height:1.5;">${specialDescription || 'Details shared'}</p>
                                    ${specialDate ? `<p style="margin:6px 0 0;color:#78716c;font-size:12px;">📅 ${new Date(specialDate).toLocaleString()}</p>` : ''}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>`;
        }

        let visitorNotesSection = '';
        if (notes) {
            visitorNotesSection = `
                <tr>
                    <td style="padding:0 30px 20px;">
                        <div style="background:#f9fafb;border-radius:8px;padding:12px 16px;border:1px solid #e5e7eb;">
                            <p style="margin:0;color:#6b7280;font-size:12px;font-weight:600;">📝 Your notes:</p>
                            <p style="margin:4px 0 0;color:#374151;font-size:13px;">${notes}</p>
                        </div>
                    </td>
                </tr>`;
        }

        const nextStepDelivery = deliveryOption === 'Delivery'
            ? "We'll deliver it to your address!"
            : "You can pick it up at our location.";

        visitorHtml = visitorHtml
            .replace(/\{\{CUSTOMER_NAME\}\}/g, name)
            .replace('{{ORDER_TYPE}}', orderType)
            .replace('{{ORDER_CATEGORY}}', category)
            .replace('{{ORDER_ITEM}}', item)
            .replace('{{ORDER_QUANTITY}}', quantity)
            .replace('{{DELIVERY_OPTION}}', deliveryOption)
            .replace('{{DELIVERY_SECTION}}', visitorDeliverySection)
            .replace('{{SPECIAL_SECTION}}', visitorSpecialSection)
            .replace('{{NOTES_SECTION}}', visitorNotesSection)
            .replace('{{NEXT_STEP_DELIVERY}}', nextStepDelivery);

        // Send email to host
        await transporter.sendMail({
            from: `"Eats N Sips Orders" <${process.env.EMAIL_USER}>`,
            to: 'eatsnsipsafrica@gmail.com',
            subject: `🍽️ New Order: ${item} (×${quantity}) from ${name}`,
            html: hostHtml
        });

        // Send confirmation to customer
        await transporter.sendMail({
            from: `"Eats N Sips Africa" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `✅ Order Confirmed - ${item} | Eats N Sips Africa`,
            html: visitorHtml
        });

        return res.status(200).json({
            success: true,
            message: 'Order placed successfully! Check your email for confirmation.'
        });

    } catch (error) {
        console.error('Order processing error:', error);
        return res.status(500).json({
            error: 'Failed to process order. Please try again or contact us directly.'
        });
    }
};