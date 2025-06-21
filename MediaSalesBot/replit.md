# AVShop Telegram Bot

## Overview

AVShop is a Telegram bot-based e-commerce platform built with Node.js and Telegraf. The bot serves as a digital storefront offering three main product categories: digital products (business plans, guides, media files), physical products (electronics accessories), and ready-made Telegram channels. The system provides automated order management, multiple payment methods, and administrative functionality for order tracking.

## System Architecture

The application follows a modular Node.js architecture with clear separation of concerns:

- **Entry Point**: `index.js` serves as the main bot instance and router
- **Handlers**: Separate modules for command handling and admin functionality
- **Services**: Business logic for order management, payment processing, and PDF generation
- **Configuration**: Product catalog and payment settings
- **Utilities**: Helper functions and keyboard layouts
- **Data**: Static content for digital products

The bot uses an in-memory data store for orders and sessions, making it suitable for small to medium-scale operations.

## Key Components

### Bot Framework
- **Telegraf**: Primary framework for Telegram bot functionality
- **Session Management**: In-memory session tracking for user interactions
- **Callback Query Handling**: Interactive button-based navigation

### Product Management
- **Digital Products**: Automated PDF generation and delivery
- **Physical Products**: Order tracking with manual fulfillment
- **Channel Sales**: Telegram channel transfer with external payment

### Payment Processing
- **Telegram Stars**: Native Telegram payment for digital products
- **Click/Uzcard**: Uzbekistan payment systems
- **Bank Cards**: Traditional card payments
- **External Cards**: Visa payments for channel purchases

### Order Management
- **In-Memory Storage**: Simple Map-based order tracking
- **Status Tracking**: Pending, paid, completed, cancelled states
- **Admin Interface**: Order management and status updates

### Content Generation
- **PDFKit Integration**: Dynamic PDF generation for business plans
- **File Management**: Automated file delivery system

## Data Flow

1. **User Interaction**: Users interact via Telegram commands and inline keyboards
2. **Product Selection**: Users browse categorized product catalog
3. **Order Creation**: System generates unique order IDs and tracks user selections
4. **Payment Processing**: Multiple payment methods with appropriate routing
5. **Order Fulfillment**: Automated delivery for digital products, manual for physical
6. **Admin Management**: Administrators can view and update order statuses

## External Dependencies

### Required Packages
- `telegraf`: Telegram Bot API framework
- `pdfkit`: PDF generation library

### Payment Systems
- Telegram Stars (native integration)
- Click payment system (Uzbekistan)
- Uzcard (local banking)
- International Visa cards

### File Generation
- PDF documents for business content
- ZIP archives for media collections

## Deployment Strategy

The application is configured for Replit deployment with:
- **Runtime**: Node.js 20
- **Auto-installation**: Dependencies installed on startup
- **Environment Variables**: Bot token configuration
- **File Storage**: Local file system for generated content

The bot can be easily deployed to other Node.js hosting platforms by:
1. Setting the `BOT_TOKEN` environment variable
2. Installing dependencies with `npm install`
3. Running with `node index.js`

## Changelog

- June 21, 2025: AVShop Telegram bot system fully implemented and operational
  - Main bot (@AVShopofficialbot) with complete catalog and purchase system
  - Support bot (@AVShopofficialsupportbot) with FAQ and admin messaging
  - Fixed all callback handler errors and navigation issues
  - Added dual admin access for @Ashraf_ASH2013 and @m_asadbek_b
  - Both bots running successfully with admin panels
  - Complete product catalog with automated digital delivery
  - All payment methods integrated and tested

## User Preferences

Preferred communication style: Simple, everyday language.