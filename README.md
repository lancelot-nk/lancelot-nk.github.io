# 💠 Lancelot V2 | The Digital Nexus

A high-performance, interactive portfolio and technical archive designed to operate at the intersection of data science, software engineering, and digital infrastructure.

---

## 🛠 Tech Stack & Tooling

The site is built for extreme performance and visual fidelity, utilizing a modern reactive architecture.

### **Core Frameworks**
* **React 18**: Component-based UI architecture.
* **Vite**: Next-generation frontend tooling for near-instant Hot Module Replacement (HMR).
* **Tailwind CSS**: Utility-first styling with custom HSL brand token integration.

### **Animation & Graphics**
* **Framer Motion**: Orchestrating complex 2D transitions and layout animations.
* **HTML5 Canvas**: Powering the high-DPI `ParticleField` background with custom physics.
* **Lucide React**: Vector-based iconography for crisp scaling on all displays.

### **Development Environment**
* **Path Aliasing**: Configured via Vite and JSConfig for clean `@/*` directory resolution.
* **ESLint**: Strict linting for code quality and maintainability.
* **PostCSS**: Handling CSS logic and Tailwind preprocessing.

---

## 🏗 Operations & Deployment

* **Branch Strategy**: Primary development and live production occur on the `V2` branch.
* **CI/CD**: Automated deployment via GitHub Actions, optimized for Vite build artifacts.
* **Version Control**: Atomic commit strategy for tracking architectural iterations.

---

## 🎨 Design Philosophy

> "The Nexus is a functional map of technical capability and digital mastery."

This site was **fully conceptualized and designed by Lancelot Naipier-Kane**. 

Every element—from the dendritic SVG paths in the Nexus navigation to the ultra-low rendering optimizations for the particle systems—was crafted to reflect a high-fidelity, data-driven aesthetic. 

---

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build