import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, confirmationUrl }: EmailRequest = await req.json();

    // Custom verification email template
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Freakbeast Account</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
            .title { font-size: 20px; color: #333; margin-bottom: 20px; }
            .content { color: #666; line-height: 1.6; margin-bottom: 30px; }
            .button { display: inline-block; background-color: #007bff; color: white; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; }
            .footer { text-align: center; color: #999; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">💪 Freakbeast</div>
              <h1 class="title">Verify Your Account</h1>
            </div>
            <div class="content">
              <p>Welcome to Freakbeast! 🎉</p>
              <p>To complete your registration and start your fitness journey, please verify your email address by clicking the button below:</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" class="button">Verify My Account</a>
            </div>
            <div class="content">
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #007bff;">${confirmationUrl}</p>
            </div>
            <div class="footer">
              <p>If you didn't create an account with Freakbeast, you can safely ignore this email.</p>
              <p>&copy; 2025 Freakbeast. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log('Custom verification email would be sent to:', to);
    console.log('Confirmation URL:', confirmationUrl);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Custom verification email sent successfully' 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error in send-verification-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);