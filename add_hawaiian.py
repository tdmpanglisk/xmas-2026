c = open('src/components/Hero.jsx', 'r', encoding='utf-8').read()

# Add the Hawaiian decorative cards after the countdown div
new_cards = '''          <div className='flex items-center justify-center space-x-8 mb-12 flex-wrap'>
            <div className='bg-xmas-night/50 backdrop-blur-sm border-2 border-xmas-gold/50 rounded-2xl p-6'>
              <div className='text-8xl animate-float'>🐷🌺</div>
              <p className='text-xmas-gold font-medium mt-2'>Kālua Pig with Lei</p>
            </div>
            <div className='bg-xmas-night/50 backdrop-blur-sm border-2 border-xmas-gold/50 rounded-2xl p-6'>
              <div className='text-8xl animate-float' style={{animationDelay: "1s"}}>馬</div>
              <p className='text-xmas-gold font-medium mt-2'>馬 — Year of the Horse</p>
            </div>
          </div>'''

c = c.replace('</div>          <div className=\'flex flex-col sm:flex-row items-center justify-center gap-4 mb-16\'>', new_cards + '\n          <div className=\'flex flex-col sm:flex-row items-center justify-center gap-4 mb-16\'>')

# Add floating Hawaiian decorations at the end (before closing section)
floating_decor = '''
      <div className="absolute top-20 left-10 w-32 h-32 opacity-20 ornament" style={{ "--delay": "0s" }}>
        <span className="text-6xl">🌺</span>
      </div>
      <div className="absolute top-30 right-10 w-24 h-24 opacity-15 ornament" style={{ "--delay": "1s" }}>
        <span className="text-5xl">🌴</span>
      </div>
      <div className="absolute bottom-20 left-15 w-28 h-28 opacity-15 ornament" style={{ "--delay": "2s" }}>
        <span className="text-5xl">🌊</span>
      </div>
      <div className="absolute top-40 right-20 w-20 h-20 opacity-15 ornament" style={{ "--delay": "0.5s" }}>
        <span className="text-4xl">馬</span>
      </div>
      <div className="absolute bottom-30 right-15 w-24 h-24 opacity-15 ornament" style={{ "--delay": "1.5s" }}>
        <span className="text-5xl">🍍</span>
      </div>'''

# Insert before the closing </section>
c = c.replace('    </section>', floating_decor + '\n    </section>')

open('src/components/Hero.jsx', 'w', encoding='utf-8').write(c)
print('Done')