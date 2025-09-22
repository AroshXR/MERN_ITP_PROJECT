import React from 'react';
import NavBar from '../NavBar/navBar';
import './SkinToneColorGuide.css';

const toneGuides = [
  {
    id: 'fair',
    title: 'Fair / Light Skin',
    description: 'Porcelain, ivory, or light beige complexions that can look washed out by pale shades.',
    bestColors: [
      'Emerald green',
      'Sapphire blue',
      'Amethyst purple',
      'Navy',
      'Burgundy',
      'Blush pastels'
    ],
    avoidColors: [
      'Beige',
      'Light yellow',
      'Very pale tan'
    ],
    palette: ['#0f5d9d', '#31489d', '#8b4eb2', '#193153', '#9c1c3f', '#f2c7d5']
  },
  {
    id: 'medium',
    title: 'Medium / Olive Skin',
    description: 'Warm beige, tan, or olive tones that glow in rich earthy shades.',
    bestColors: [
      'Coral',
      'Terracotta',
      'Mustard',
      'Olive green',
      'Burnt orange',
      'Bronze metallics'
    ],
    avoidColors: [
      'Beige close to skin tone',
      'Muted brownish yellows'
    ],
    palette: ['#f76c5e', '#cf5c36', '#d39d38', '#54621d', '#f08a24', '#c28547']
  },
  {
    id: 'deep',
    title: 'Deep / Dark Skin',
    description: 'Rich espresso, mocha, or ebony skin that pairs beautifully with vibrant shades.',
    bestColors: [
      'Cobalt blue',
      'Hot pink',
      'Royal purple',
      'Lime green',
      'Golden yellow',
      'Bright white'
    ],
    avoidColors: [
      'Very dark brown',
      'Pure black (without contrast)'
    ],
    palette: ['#0047ab', '#ff4f9a', '#772a9c', '#7cd450', '#fdb515', '#ffffff']
  }
];

const universalColors = [
  { name: 'True Red', swatch: '#c62828' },
  { name: 'Navy Blue', swatch: '#1f3a5f' },
  { name: 'Teal', swatch: '#1c7c7d' },
  { name: 'Charcoal Gray', swatch: '#3a3f47' },
  { name: 'Pure White', swatch: '#ffffff', border: '#d0d5dd' }
];

const undertoneTips = [
  {
    title: 'Cool Undertone',
    description: 'Veins look blue/purple, silver jewelry flatters you most.',
    suggestions: ['Choose jewel tones', 'Icy pastels', 'Bright blues and purples']
  },
  {
    title: 'Warm Undertone',
    description: 'Veins look green/olive, gold jewelry feels right.',
    suggestions: ['Earthy neutrals', 'Sunset shades', 'Warm metallics like bronze']
  },
  {
    title: 'Neutral Undertone',
    description: 'Both silver and gold feel balanced.',
    suggestions: ['Mix warm and cool palettes', 'Experiment with bold contrasts']
  }
];

const SkinToneColorGuide = () => {
  return (
    <div className="color-guide-page">
      <NavBar />
      <section className="color-guide-hero">
        <div className="color-guide-hero__content">
          <h1>Find Your Perfect Palette</h1>
          <p>
            Discover the clothing shades that make your complexion glow. Explore curated color
            stories for fair, medium, and deep skin tones, plus universal hues that flatter everyone.
          </p>
        </div>
        <div className="color-guide-hero__art" aria-hidden="true">
          {['#f7d1d7', '#f2a0a0', '#e86f68', '#bb4848'].map((tone, index) => (
            <span key={tone} style={{ backgroundColor: tone, animationDelay: `${index * 0.12}s` }} />
          ))}
        </div>
      </section>

      <section className="color-guide-section">
        <h2>Skin Tone Color Matches</h2>
        <p className="section-intro">
          Each skin tone has shades that enhance its undertones. Use these guides to build outfits
          with instant harmony and contrast.
        </p>
        <div className="tone-grid">
          {toneGuides.map((tone) => (
            <article className="tone-card" key={tone.id} id={tone.id}>
              <header>
                <h3>{tone.title}</h3>
                <p>{tone.description}</p>
              </header>
              <div className="tone-card__palette" role="img" aria-label={`${tone.title} color palette`}>
                {tone.palette.map((hex) => (
                  <div key={hex} style={{ backgroundColor: hex }} />
                ))}
              </div>
              <div className="tone-card__lists">
                <div>
                  <h4>Looks amazing</h4>
                  <ul>
                    {tone.bestColors.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Use sparingly</h4>
                  <ul>
                    {tone.avoidColors.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="color-guide-section">
        <h2>Test Your Undertone</h2>
        <p className="section-intro">
          Not sure where you land? Check your veins in natural light and note which jewelry finish
          lights up your skin. Then try these color families.
        </p>
        <div className="undertone-grid">
          {undertoneTips.map((tip) => (
            <article key={tip.title} className="undertone-card">
              <h3>{tip.title}</h3>
              <p>{tip.description}</p>
              <ul>
                {tip.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="color-guide-section">
        <h2>Universal Wardrobe Staples</h2>
        <p className="section-intro">
          These shades look good on every complexion and are effortless anchors for any outfit.
        </p>
        <div className="universal-grid">
          {universalColors.map((color) => (
            <div key={color.name} className="universal-card">
              <div
                className="universal-card__swatch"
                style={{ backgroundColor: color.swatch, borderColor: color.border || color.swatch }}
                role="img"
                aria-label={`${color.name} swatch`}
              />
              <span>{color.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="color-guide-cta">
        <h2>Ready to style your next look?</h2>
        <p>
          Jump into our custom clothing experience to design outfits that highlight your unique tone
          and personality.
        </p>
        <a className="cta-button" href="/customizer">Open the customizer</a>
      </section>
    </div>
  );
};

export default SkinToneColorGuide;
