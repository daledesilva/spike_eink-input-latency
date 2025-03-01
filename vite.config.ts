import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl';

///////////////

// https://vite.dev/config/

export default defineConfig({
  
  server: {
    host: '0.0.0.0', // This makes the server accessible publicly
    port: 3000
  },

  // This gives you a basic SSL certificate
  // It's needed to enable getCoalesced function on Chrome
  plugins: [
    react(),
    basicSsl({
      name: 'test', // name of certification
      domains: ['*.custom.com'], // custom trust domains
      certDir: '/Users/.../.devServer/cert' // custom certification directory
    })
  ]

})
