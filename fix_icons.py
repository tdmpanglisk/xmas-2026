c = open('src/components/Hero.jsx', 'r', encoding='utf-8').read()

# Fix all EventDetailItem icon props from objects to JSX
c = c.replace("icon={{Calendar}}", 'icon={<Calendar className="w-6 h-6" />}')
c = c.replace("icon={{Clock}}", 'icon={<Clock className="w-6 h-6" />}')
c = c.replace("icon={{MapPin}}", 'icon={<MapPin className="w-6 h-6" />}')
c = c.replace("icon={{Users}}", 'icon={<Users className="w-6 h-6" />}')

open('src/components/Hero.jsx', 'w', encoding='utf-8').write(c)
print('Fixed icon props')