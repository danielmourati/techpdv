# Smart Checkout System

Aqui está o prompt inicial estruturado e otimizado para o Lovable, focado na Fase 1 do nosso PRD (Estruturação do Layout e Design System com dados mock):




Prompt Inicial para o Lovable:




"Create a modern, responsive 'Frente de Caixa' (Point of Sale) dashboard for a retail/wholesale business, exactly following the layout structure and color scheme (deep blue accents, white background) seen in image_0.png, image_1.png, image_2.png, and image_3.png.




The main dashboard should feature:




Multi-Sale Header: A top bar with selectable tabs for different open sales sessions (e.g., 'Venda 7 - R$ 20,00', 'Venda 8 - R$ 40,00') and a '+ Nova venda' button, mimicking the top of image_0.png and image_1.png.

Central Transaction Area: A large 'Produto Atual' display (as in image_0.png/image_1.png) showing current item name, quantity, unit price, and total (e.g., '2 × REFRIGERANTE', 'Total do Item R$ 40,00'), along with a placeholder product image. Below this, include the integrated AJAX-style search input ('Digite ou leia o produto'), quick quantity/value adjustment fields, and quick-add product tiles.

Right-Side 'Cupom' (Cart): A vertical panel titled 'CUPOM DA VENDA' listing items with product name, quantity adjustment (+/- buttons), unit price, and total per item, leading to a prominent 'TOTAL DA VENDA' summary and a green 'Finalizar Venda' button at the bottom.

Checkout Flows (Mocked): Create the underlying component structure and mock data for:




A modal overlay for PIX payment (referencing image_3.png) showing a QR Code placeholder, countdown timer, 'Copiar código PIX' button, and alternative payment methods.

A modal stepper overlay for NFC-e emission steps (referencing image_2.png) with checklist items (Preparing data, Reserving number, Sending to SEFAZ, etc.) and progress indicators.

Footer/Status Bar: Include placeholders for stock level, unit value, and sale status ('CAIXA OCUPADO' or similar) in the bottom-left corner.

The interface must be keyboard-optimized and responsive, designed as a Design System with reusable components (buttons, cards, inputs) using mock JSON data for all products and sales. Do not vertically scroll the main transaction view."

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://techpdv.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/625aa2eb-e33d-4b64-99ce-18c141d61f6e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
