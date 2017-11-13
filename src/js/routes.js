import Root from './app/views/root'
import Auth from './app/views/auth'
import Room from './app/views/room'

export default [{
  path: '/',
  component: Root,
}, {
  path: '/auth',
  component: Auth,
}, {
  path: '/room',
  component: Room,
}]
