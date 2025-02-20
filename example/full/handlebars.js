module.exports = (Handlebars) => ({
  lowercase: (text) => text.toLowerCase().replace(/\s+/g, '-'),
  splitEmail: (email) => {
      if (typeof email !== 'string') return '';
      // Replace '@' with zero-width space + '@' and return as a safe string
      const formattedEmail = email.replace('@', '&#8203;@');
      return new Handlebars.SafeString(formattedEmail);
  },
  phoneLink: (phone) => {
      if (typeof phone !== 'string') return '';
      // Strip all non-numeric characters except '+'
      const formattedPhone = phone.replace(/[^+\d]/g, '');
      return new Handlebars.SafeString(formattedPhone);
  },
  googleMapsLink: (address) => {
      if (typeof address !== 'string' || address.trim() === '') return '#';
      // Encode the address to make it URL-safe
      const encodedAddress = encodeURIComponent(address);
      return new Handlebars.SafeString(`https://www.google.com/maps?q=${encodedAddress}`);
  },
  googleMapsEmbed: (address, zoom) => {
      if (typeof address !== 'string' || address.trim() === '') return '';
      // Encode the address to make it URL-safe
      const encodedAddress = encodeURIComponent(address);
      const zoomParam = zoom ? `&z=${encodeURIComponent(zoom)}` : '';
      return new Handlebars.SafeString(
          `https://www.google.com/maps?q=${encodedAddress}&output=embed${zoomParam}`
      );
  },
  notEquals: (value1, value2) => value1 !== value2
});
