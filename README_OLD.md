# BioShield 🛡️

A comprehensive environmental monitoring dashboard for tracking heavy metal pollution in water bodies across India. Built with React, TypeScript, and TailwindCSS, featuring real-time monitoring, interactive maps, and advanced analytics with date-sensitive trend analysis.

## Features ✨

### 🏠 Home Page
- Compelling hero section with project overview
- Key statistics display
- Feature highlights with animated cards
- Call-to-action buttons

### 📊 Dashboard
- **Monitoring Cards**: Real-time pollution levels with color-coded status indicators
- **Time-series Charts**: Interactive pollution trend visualization using Recharts
- **Interactive Map**: Leaflet-powered map showing monitoring stations across India
- **Alerts Panel**: Critical alerts with popup functionality and acknowledgment system

### 📈 Analytics
- **Trend Comparisons**: Compare pollution levels across multiple stations
- **Multiple Chart Types**: Line charts, bar charts, and radar charts
- **Historical Data Table**: Sortable, filterable data with CSV export
- **Summary Statistics**: Average, maximum, and minimum pollution levels

## Tech Stack 🛠️

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS with dark theme
- **Charts**: Recharts for data visualization
- **Maps**: React-Leaflet for interactive mapping
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Date Handling**: date-fns

## Getting Started 🚀

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository** (if using git):
   ```bash
   git clone <repository-url>
   cd bioshield
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser** and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
```

## Project Structure 📁

```
src/
├── components/          # Reusable React components
│   ├── AlertsPanel.tsx     # Alert management component
│   ├── DataTable.tsx       # Historical data table
│   ├── MonitoringCard.tsx  # Pollution level cards
│   ├── MonitoringMap.tsx   # Interactive map
│   ├── Navbar.tsx          # Navigation component
│   └── PollutionChart.tsx  # Time-series charts
├── data/                # Mock data and interfaces
│   └── mockData.ts         # Sample Indian monitoring stations
├── pages/               # Main page components
│   ├── Home.tsx            # Landing page
│   ├── Dashboard.tsx       # Main monitoring dashboard
│   └── Analytics.tsx       # Advanced analytics page
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Features in Detail 🔍

### Monitoring Cards
- **Color-coded Status**: Green (safe), Yellow (caution), Red (danger)
- **Trend Indicators**: Up/down/stable trend arrows
- **Threshold Visualization**: Visual progress bars showing current levels
- **Hover Animations**: Smooth scale effects on interaction

### Interactive Map
- **Custom Markers**: Color-coded pins based on pollution status
- **Detailed Popups**: Station information with current pollutant levels
- **Smooth Animations**: Pulse effects on markers
- **India-focused**: Centered on Indian region with realistic coordinates

### Time-series Charts
- **Multiple Pollutants**: Lead, Mercury, Cadmium, Arsenic tracking
- **Interactive Tooltips**: Detailed information on hover
- **Responsive Design**: Adapts to different screen sizes
- **Reveal Animations**: Smooth chart loading effects

### Alert System
- **Real-time Notifications**: Critical and warning alerts
- **Modal Popups**: Detailed alert information
- **Acknowledgment System**: Mark alerts as resolved
- **Priority Sorting**: Critical alerts shown first

### Analytics Dashboard
- **Station Comparison**: Compare up to 8 monitoring stations
- **Multiple Chart Types**: Line trends, bar comparisons, radar profiles
- **Historical Analysis**: 90 days of historical data
- **Data Export**: CSV export functionality
- **Advanced Filtering**: Date range and parameter filtering

## Sample Data 📋

The application includes realistic mock data for 8 monitoring stations across India:

- **Delhi** (Yamuna River) - Danger status
- **Varanasi** (Ganges) - Caution status  
- **Kolkata** (Hooghly River) - Caution status
- **Nashik** (Godavari River) - Safe status
- **Bangalore** (Kaveri River) - Safe status
- **Bhopal** (Narmada River) - Caution status
- **Ahmedabad** (Sabarmati River) - Danger status
- **Vijayawada** (Krishna River) - Safe status

Each station includes:
- Real GPS coordinates
- Current pollutant levels (Lead, Mercury, Cadmium, Arsenic)
- Status classification
- Historical trend data

## Responsive Design 📱

- **Mobile-first**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for medium screens
- **Desktop Enhanced**: Full feature set on large screens
- **Touch-friendly**: Optimized for touch interactions

## Development Scripts 🧰

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Future Enhancements 🚀

- **Real API Integration**: Connect to actual monitoring systems
- **User Authentication**: Multi-user support with roles
- **Push Notifications**: Real-time browser notifications
- **Data Export**: Excel and PDF export options
- **Machine Learning**: Predictive pollution modeling
- **Mobile App**: React Native companion app

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Indian Central Pollution Control Board for water quality standards
- OpenStreetMap contributors for mapping data
- React and TypeScript communities for excellent documentation
- All open-source library maintainers

---

Built with ❤️ by BioShield for environmental protection in India 🇮🇳
