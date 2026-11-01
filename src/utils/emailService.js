import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../constants';

/**
 * Initialize EmailJS with public key
 */
export const initEmailJS = () => {
  if (EMAILJS_CONFIG.publicKey && 
      EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY' &&
      EMAILJS_CONFIG.serviceId &&
      EMAILJS_CONFIG.serviceId !== 'YOUR_SERVICE_ID' &&
      EMAILJS_CONFIG.templateId &&
      EMAILJS_CONFIG.templateId !== 'YOUR_TEMPLATE_ID') {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }
};

/**
 * Check if EmailJS is properly configured
 */
const isEmailJSConfigured = () => {
  return EMAILJS_CONFIG.publicKey && 
         EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY' &&
         EMAILJS_CONFIG.serviceId && 
         EMAILJS_CONFIG.serviceId !== 'YOUR_SERVICE_ID' &&
         EMAILJS_CONFIG.templateId && 
         EMAILJS_CONFIG.templateId !== 'YOUR_TEMPLATE_ID' &&
         EMAILJS_CONFIG.hostTemplateId && 
         EMAILJS_CONFIG.hostTemplateId !== 'YOUR_HOST_TEMPLATE_ID';
};

/**
 * Send RSVP confirmation email to guest
 */
export const sendGuestConfirmation = async (rsvpData) => {
  const configured = isEmailJSConfigured();
  console.log('[EmailJS] Guest confirmation - configured:', configured, 'config:', {
    hasPublicKey: !!EMAILJS_CONFIG.publicKey,
    hasServiceId: !!EMAILJS_CONFIG.serviceId,
    hasTemplateId: !!EMAILJS_CONFIG.templateId,
    publicKey: EMAILJS_CONFIG.publicKey ? 'SET' : 'MISSING',
    serviceId: EMAILJS_CONFIG.serviceId,
    templateId: EMAILJS_CONFIG.templateId,
  });
  
  if (!configured) {
    console.log('EmailJS not configured - simulating guest confirmation email');
    console.log('Would send to:', rsvpData.email);
    return { success: true, simulated: true };
  }

  try {
    // Defensive checks for arrays
    const foodSelections = rsvpData.foodSelections || [];
    const dietaryRestrictions = rsvpData.dietaryRestrictions || [];
    
    // Convert dietary IDs to readable labels
    const { DIETARY_OPTIONS } = await import('../constants');
    const dietaryLabels = dietaryRestrictions
      .map(id => DIETARY_OPTIONS.find(d => d.id === id)?.label || id)
      .join(', ');
    
    const templateParams = {
      to_email: rsvpData.email, 
      guest_name: rsvpData.name,
      guest_email: rsvpData.email,
      attendance: rsvpData.attendance === 'yes' ? 'Yes' : rsvpData.attendance === 'maybe' ? 'Maybe' : 'No',
      party_size: rsvpData.partySize,
      food_items: foodSelections.length > 0
        ? foodSelections.map(f => `${f.name} (serves ${f.serves})`).join(', ')
        : 'Not specified',
      dietary_restrictions: dietaryLabels || 'None',
      special_requests: rsvpData.specialRequests || 'None',
      event_date: 'December 25, 2026',
      event_time: '5:00 PM - 11:00 PM',
      event_address: '1183 Hainstock Green SW, Edmonton, AB T6W3B6',
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    return { success: true, response };
  } catch (error) {
    console.error('[EmailJS] Failed to send guest confirmation:', error);
    return { success: false, error };
  }
};

/**
 * Send notification email to host
 */
export const sendHostNotification = async (rsvpData) => {
  const configured = isEmailJSConfigured();
  console.log('[EmailJS] Host notification - configured:', configured);
  
  if (!configured) {
    console.log('EmailJS not configured - simulating host notification email');
    console.log('New RSVP:', rsvpData);
    return { success: true, simulated: true };
  }

  try {
    // Defensive checks for arrays
    const foodSelections = rsvpData.foodSelections || [];
    const dietaryRestrictions = rsvpData.dietaryRestrictions || [];
    
    // Convert dietary IDs to readable labels
    const { DIETARY_OPTIONS } = await import('../constants');
    const dietaryLabels = dietaryRestrictions
      .map(id => DIETARY_OPTIONS.find(d => d.id === id)?.label || id)
      .join(', ');
    
    const templateParams = {
      to_email: 'tranmahpaulson@gmail.com',  // ← Your host email
      host_name: 'Holiday Family',
      guest_name: rsvpData.name,
      guest_email: rsvpData.email,
      guest_phone: rsvpData.phone || 'Not provided',
      attendance: rsvpData.attendance === 'yes' ? '✅ Attending' : rsvpData.attendance === 'maybe' ? '🤔 Maybe' : '❌ Not Attending',
      party_size: rsvpData.partySize,
      total_guests: rsvpData.partySize,
      food_items: foodSelections.length > 0
        ? foodSelections.map(f => `• ${f.name} (serves ${f.serves}) [${f.category}]`).join('\n')
        : 'No food selections',
      dietary_restrictions: dietaryLabels || 'None',
      special_requests: rsvpData.specialRequests || 'None',
      submitted_at: new Date().toLocaleString(),
      event_date: 'December 20, 2026',
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.hostTemplateId,
      templateParams
    );

    return { success: true, response };
  } catch (error) {
    console.error('[EmailJS] Failed to send host notification:', error);
    return { success: false, error };
  }
};

/**
 * Send both emails
 */
export const sendRSVPEmails = async (rsvpData) => {
  const [guestResult, hostResult] = await Promise.all([
    sendGuestConfirmation(rsvpData),
    sendHostNotification(rsvpData),
  ]);

  return {
    guest: guestResult,
    host: hostResult,
    allSuccess: guestResult.success && hostResult.success,
  };
};
