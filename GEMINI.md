# Project Context: Amazon Frontend (Angular E-commerce)

## Overview
This is a modern e-commerce frontend application built with **Angular 19**, designed to replicate core functionalities of Amazon. It features a product catalog, shopping cart, checkout process, and payment simulation. The project emphasizes a component-based architecture and responsive design.

## Technology Stack
*   **Framework:** Angular 19.x
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS 4.x (with Flowbite components)
*   **State Management:** Angular Services & RxJS (`BehaviorSubject` for local state)
*   **Routing:** Angular Router
*   **Build Tool:** Angular CLI

## Project Structure
The source code is located in `src/app/` and follows a feature-based folder structure:

*   `cart/` - Shopping cart components and logic.
*   `checkout/` - Checkout process and forms.
*   `core/` - Singleton services (e.g., `ProductService`, `ApiService`) and guards.
*   `home/` - Homepage components (product listings, offers).
*   `mock/` - Static data for development and testing.
*   `payment/` - Payment processing screens (e.g., Success page).
*   `product/` - Product details page.
*   `shared/` - Reusable components (`footer`, `navbar`) and models (`product.ts`, `cart-product.ts`).
*   `app.routes.ts` - Application routing configuration.

## Key Commands

### Development
*   **Start Server:** `npm start` (or `ng serve`) - Runs on `http://localhost:4200`.
*   **Watch Mode:** `npm run watch` - Builds and watches for changes.

### Build & Test
*   **Production Build:** `npm run build` (or `ng build`) - Outputs to `dist/`.
*   **Run Tests:** `npm test` (or `ng test`) - Executes unit tests via Karma/Jasmine.

## Development Conventions
*   **Styling:** Utility-first CSS with Tailwind. Flowbite components are used for UI elements.
*   **Data Fetching:** Services (e.g., `ProductService`) encapsulate data logic, utilizing `ProductApiService` for network requests and internal caching (`productsCache`).
*   **Reactive Programming:** Extensive use of RxJS `Observable` and `BehaviorSubject` for handling asynchronous data streams.
*   **Standalone Components:** Angular 19 conventions are likely followed (checking `main.ts` or component files would confirm, but `app.routes.ts` usage suggests modern router setup).

## Configuration Files
*   `angular.json`: Workspace configuration.
*   `package.json`: Dependencies and scripts.
*   `tailwind.config.js` (or similar): Tailwind CSS configuration (implied by `postcss` usage).
*   `tsconfig.json`: TypeScript compiler options.
