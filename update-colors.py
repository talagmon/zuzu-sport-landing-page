#!/usr/bin/env python3
"""
Script to apply ocean-coral color palette to all HTML pages
"""

import os
import re
from pathlib import Path

# Ocean-coral color definitions
OCEAN_CORAL_COLORS = '''// Original colors (keeping for fallback)
                        'sage': '#8FBC8F',
                        'coral': '#FF7F7F', 
                        'teal': '#2F4F4F',
                        'cream': '#FDF5E6',
                        // Ocean-coral color palette - calming and sophisticated
                        'ocean-deep': '#0077B6',
                        'ocean-bright': '#00B4D8',
                        'ocean-light': '#90E0EF',
                        'ocean-pale': '#CAF0F8',
                        'coral-soft': '#F5B7B1',
                        // Additional complementary colors
                        'ocean-cream': '#F8FCFF',
                        'coral-light': '#FADBD8',
                        'ocean-medium': '#48B2D8' '''

OCEAN_BODY_BACKGROUND = '#F8FCFF'

OCEAN_HERO_GRADIENT = '''background: linear-gradient(135deg, 
                #F8FCFF 0%,     /* ocean-cream */
                #CAF0F8 25%,    /* ocean-pale */
                #90E0EF 50%,    /* ocean-light */
                #00B4D8 75%,    /* ocean-bright */
                #F5B7B1 100%    /* coral-soft accent */
            );'''

OCEAN_BUTTON_STYLES = '''background: linear-gradient(135deg, #00B4D8 0%, #0077B6 100%); /* ocean-bright to ocean-deep */
            transition: all 0.3s ease;
            border: none;
            color: white;
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);'''

OCEAN_BUTTON_HOVER = '''transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(0, 180, 216, 0.4); /* ocean-bright shadow */
            background: linear-gradient(135deg, #48B2D8 0%, #90E0EF 100%); /* lighter ocean gradient on hover */'''

OCEAN_PROGRESS_BAR = '''background: linear-gradient(90deg, #90E0EF 0%, #00B4D8 50%, #F5B7B1 100%); /* ocean-light to ocean-bright to coral-soft */'''

OCEAN_TYPEWRITER_CURSOR = '''border-right: 3px solid #374151; /* gray-700 cursor to match text */
            animation: blink 1s infinite;'''

def update_html_file(filepath):
    """Update a single HTML file with ocean-coral colors"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Update Tailwind color configuration
        color_pattern = r"colors:\s*{[^}]*'cream':\s*'[^']*'[^}]*}"
        if re.search(color_pattern, content, re.DOTALL):
            new_colors = f"""colors: {{
                        {OCEAN_CORAL_COLORS}
                    }}"""
            content = re.sub(color_pattern, new_colors, content, flags=re.DOTALL)
        
        # Update body background
        content = re.sub(
            r'background-color:\s*#FDF5E6;',
            f'background-color: {OCEAN_BODY_BACKGROUND}; /* ocean-cream - fresh and clean */',
            content
        )
        
        # Update hero gradient
        hero_pattern = r'background:\s*linear-gradient\(135deg,\s*#8FBC8F[^;]*;'
        if re.search(hero_pattern, content):
            content = re.sub(hero_pattern, OCEAN_HERO_GRADIENT, content)
        
        # Update button styles
        btn_pattern = r'\.btn-primary\s*{[^}]*}'
        if re.search(btn_pattern, content, re.DOTALL):
            new_btn = f'''.btn-primary {{
            {OCEAN_BUTTON_STYLES}
        }}'''
            content = re.sub(btn_pattern, new_btn, content, flags=re.DOTALL)
        
        # Update button hover
        btn_hover_pattern = r'\.btn-primary:hover\s*{[^}]*}'
        if re.search(btn_hover_pattern, content, re.DOTALL):
            new_btn_hover = f'''.btn-primary:hover {{
            {OCEAN_BUTTON_HOVER}
        }}'''
            content = re.sub(btn_hover_pattern, new_btn_hover, content, flags=re.DOTALL)
        
        # Update progress bar
        progress_pattern = r'\.progress-bar\s*{[^}]*background:[^;]*;'
        content = re.sub(
            progress_pattern,
            f'''.progress-bar {{
            {OCEAN_PROGRESS_BAR}''',
            content,
            flags=re.DOTALL
        )
        
        # Update typewriter cursor
        typewriter_pattern = r'border-right:\s*[^;]*;\s*/\*[^*]*cursor[^*]*\*/'
        content = re.sub(typewriter_pattern, OCEAN_TYPEWRITER_CURSOR, content)
        
        # Replace sage colors with ocean-light
        replacements = {
            'bg-sage': 'bg-ocean-light',
            'text-sage': 'text-ocean-light',
            'border-sage': 'border-ocean-light',
            'bg-sage/10': 'bg-ocean-light/10',
            'bg-sage/20': 'bg-ocean-light/20',
            'focus:ring-sage': 'focus:ring-ocean-light'
        }
        
        for old, new in replacements.items():
            content = content.replace(old, new)
        
        # Update CTA and footer backgrounds to ocean-pale
        content = re.sub(
            r'class="([^"]*?)bg-teal([^"]*?)"',
            r'class="\1\2" style="background-color: #CAF0F8;"',
            content
        )
        
        # Save only if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Error updating {filepath}: {e}")
        return False

def main():
    """Main function to update all HTML files"""
    current_dir = Path('.')
    html_files = list(current_dir.glob('*.html'))
    
    print("🌊 Applying Ocean-Coral Color Palette to all pages...")
    print(f"Found {len(html_files)} HTML files")
    
    updated_files = []
    
    for html_file in html_files:
        if html_file.name in ['original_landing.html']:  # Skip backup files
            continue
            
        print(f"Updating {html_file.name}...")
        if update_html_file(html_file):
            updated_files.append(html_file.name)
            print(f"✅ Updated {html_file.name}")
        else:
            print(f"⚠️  No changes needed for {html_file.name}")
    
    print(f"\n🎨 Ocean-Coral color palette applied to {len(updated_files)} files:")
    for filename in updated_files:
        print(f"  • {filename}")
    
    print("\n🌊 Color palette update complete!")

if __name__ == "__main__":
    main()