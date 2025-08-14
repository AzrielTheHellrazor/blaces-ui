# Blaces - Collaborative Pixel Art Canvas

Blaces is a collaborative pixel art canvas application built on Base with MiniKit, inspired by r/place. Users can create events, upload images to convert to pixel art, and collaborate on creating pixel art together in real-time.

## Features

### 🎨 Collaborative Canvas
- Real-time collaborative pixel art creation
- Multiple canvas sizes (16x16, 32x32, 64x64, 128x128)
- Zoom and pan functionality for detailed work
- Color palette with r/place-inspired colors

### 📱 Image-to-Pixel Conversion
- Drag-and-drop image upload
- Automatic conversion to pixel art
- Adjustable pixel size effects
- Preview functionality
- Support for PNG, JPG, and other image formats

### 🎯 Pixel Matching & Feedback
- Silhouette overlay system
- Real-time pixel matching feedback
- Green highlights for correct pixels
- Red highlights for incorrect pixels
- Toggle feedback visibility

### 🔗 Event Management
- Create events with custom names and descriptions
- QR code generation for easy sharing
- Event-specific canvas sizes
- Local storage for event persistence

### 🌐 Farcaster Integration
- MiniKit integration for Farcaster
- Frame metadata support
- Account association capabilities
- Background notifications

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Base, MiniKit, OnchainKit
- **Social**: Farcaster integration
- **Storage**: Local Storage, Redis (for notifications)
- **Build Tool**: Bun

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Farcaster account (for full functionality)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blaces
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
# Copy .env.example to .env.local
cp .env.example .env.local
```

Required environment variables:
```bash
# Shared/OnchainKit variables
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=
NEXT_PUBLIC_URL=
NEXT_PUBLIC_ICON_URL=
NEXT_PUBLIC_ONCHAINKIT_API_KEY=

# Frame metadata
FARCASTER_HEADER=
FARCASTER_PAYLOAD=
FARCASTER_SIGNATURE=
NEXT_PUBLIC_APP_ICON=
NEXT_PUBLIC_APP_SUBTITLE=
NEXT_PUBLIC_APP_DESCRIPTION=
NEXT_PUBLIC_APP_SPLASH_IMAGE=
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=
NEXT_PUBLIC_APP_PRIMARY_CATEGORY=
NEXT_PUBLIC_APP_HERO_IMAGE=
NEXT_PUBLIC_APP_TAGLINE=
NEXT_PUBLIC_APP_OG_TITLE=
NEXT_PUBLIC_APP_OG_DESCRIPTION=
NEXT_PUBLIC_APP_OG_IMAGE=

# Redis config
REDIS_URL=
REDIS_TOKEN=
```

4. Start the development server:
```bash
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating an Event
1. Click "Create Event" on the home page
2. Enter event name, description, and choose canvas size
3. Click "Create" to generate event
4. Share the QR code or event link with others

### Joining an Event
1. Click "Join Event" on the home page
2. Enter the 8-character event code
3. Start collaborating on the pixel art

### Uploading Images
1. In an event, use the drag-and-drop area to upload an image
2. Adjust pixel size effect using the slider
3. Preview the converted image
4. The image will appear as a silhouette overlay

### Pixel Matching
1. Upload an image to create a silhouette
2. Toggle "Show Feedback" to see matching results
3. Green borders indicate correct pixels
4. Red borders indicate incorrect pixels

## Project Structure

```
blaces/
├── app/
│   ├── components/
│   │   ├── BlacesComponents.tsx    # Main canvas and UI components
│   │   ├── ImageUpload.tsx         # Image upload and processing
│   │   ├── DemoComponents.tsx      # Reusable UI components
│   │   └── CanvasClient.tsx        # Canvas client wrapper
│   ├── api/
│   │   ├── notify/                 # Notification endpoints
│   │   └── webhook/                # Webhook handlers
│   ├── create-event/               # Event creation page
│   ├── join-event/                 # Event joining page
│   ├── event/[eventId]/            # Event canvas page
│   └── ...
├── lib/
│   ├── notification-client.ts      # Notification utilities
│   ├── notification.ts             # Notification types
│   └── redis.ts                    # Redis configuration
└── ...
```

## Contributing

We welcome contributions to Blaces! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow existing code style and patterns
- Add comments for complex logic
- Write meaningful commit messages
- Test your changes before submitting

### Areas for Contribution
- **UI/UX Improvements**: Better mobile experience, new themes
- **Performance**: Optimize canvas rendering, reduce memory usage
- **Features**: New canvas tools, collaboration features
- **Backend**: Server-side storage, real-time collaboration
- **Testing**: Unit tests, integration tests
- **Documentation**: API docs, user guides

## Customization

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by r/place
- Built on Base with MiniKit
- Powered by Farcaster
- Uses OnchainKit for seamless integration

## Learn More

- [MiniKit Documentation](https://docs.base.org/builderkits/minikit/overview)
- [OnchainKit Documentation](https://docs.base.org/builderkits/onchainkit/getting-started)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Farcaster Documentation](https://docs.farcaster.xyz/)
