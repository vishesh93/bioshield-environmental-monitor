# WARP.md

This file provides guidance to WARP (warp.dev) when working with the BioShield environmental monitoring dashboard repository.

## Development Commands

### Core Development Workflow
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint
```

### Development Notes
- The project uses Vite as the build tool, which provides fast development with hot module replacement
- TypeScript compilation happens during build (`tsc && vite build`)
- ESLint configuration allows `@typescript-eslint/no-explicit-any: 'off'` and treats unused vars as warnings
- No test runner is currently configured in this project

## Architecture Overview

### Tech Stack
- **React 18** with TypeScript and Vite
- **TailwindCSS** for styling with custom theme colors (`safe`, `caution`, `danger`) and animations
- **React Router DOM** for client-side routing with 3 main routes
- **Recharts** for data visualization (time series charts)
- **React-Leaflet** + **Leaflet** for interactive maps
- **Framer Motion** for animations and transitions
- **Lucide React** for icons
- **date-fns** for date handling

### Application Structure
The app follows a clean architecture with clear separation:

```
src/
├── components/      # Reusable UI components
├── pages/          # Route-level page components  
├── data/           # Data interfaces and mock data
├── App.tsx         # Main app with router setup
└── main.tsx        # React app entry point
```

### Key Components Architecture

**MonitoringCard**: Feature-rich card component with:
- Status-based styling and animations
- Trend indicators with color-coded directions
- Threshold visualization with gradient progress bars
- Framer Motion hover effects

**Dashboard Page**: Central monitoring hub that:
- Aggregates data from all monitoring stations for overview metrics
- Uses useMemo for expensive calculations
- Manages alert state with acknowledgment functionality
- Renders 4 main sections: cards, charts, map, and alerts

**Data Layer**: Mock data system with:
- TypeScript interfaces for `MonitoringStation`, `TimeSeriesData`, `Alert`
- 8 realistic Indian monitoring stations with GPS coordinates
- Time series data generators for charts
- Status classification based on pollutant thresholds

### State Management Patterns
- Uses React's built-in state (useState, useMemo) 
- No external state management library
- Alert state is managed at the Dashboard level and passed down
- Time series data is memoized to prevent unnecessary regeneration

### Styling System
TailwindCSS with custom configuration:
- Custom colors: `safe` (green), `caution` (yellow), `danger` (red)
- Custom animations: `fade-in`, `slide-up`, `pop-in`
- Dark theme as default (`bg-gray-900` base)
- Responsive design with mobile-first approach

### Data Flow
1. Mock data (`mockData.ts`) provides realistic Indian water monitoring data
2. Dashboard aggregates station data into overall metrics
3. Components receive calculated props and render with appropriate styling
4. User interactions (like alert acknowledgment) update local state
5. Framer Motion handles page transitions and component animations

### Route Structure
- `/` - Home page with project overview and features
- `/dashboard` - Main monitoring dashboard with real-time view
- `/analytics` - Advanced analytics with historical data, comparisons, and date-filtered trends

## Development Patterns

### Component Props Pattern
Components use well-defined TypeScript interfaces for props with specific union types for status (`'safe' | 'caution' | 'danger'`) and trends (`'up' | 'down' | 'stable'`).

### Animation Pattern
Consistent Framer Motion usage with:
- Initial page load animations (`initial`, `animate`, `transition`)
- Hover effects with `whileHover`
- Staggered animations for lists/grids

### Threshold-Based Logic
Pollutant monitoring uses consistent threshold patterns:
- Safe limits (green status)
- Caution limits (yellow status) 
- Danger threshold (red status)
- Visual indicators match status colors

### Mock Data Generation
Time series data uses realistic patterns:
- Base values with random variation
- Station-specific multipliers for different pollution levels
- Date-based generation for historical trends
- Date-filtered data with seasonal factors and realistic variation

### Date-Sensitive Analytics
The Analytics page includes a date-sensitive chart feature:
- Date range picker for custom time periods
- Area chart with gradient fills for visual appeal
- Real-time data filtering based on selected date range
- Seasonal variation simulation in generated data

## Type Definitions

Key interfaces in `src/data/mockData.ts`:
- `MonitoringStation` - Water monitoring station data
- `TimeSeriesData` - Time series chart data points
- `Alert` - Alert system data structure

Pollutant measurements are in ppm (parts per million) with established thresholds for Lead, Mercury, Cadmium, and Arsenic.