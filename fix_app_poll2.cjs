const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const pollerCode = `
function NotificationPoller() {
  const { addNotification } = useNotifications();
  
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:3001/api/notifications/poll', {
        headers: { 'x-session-id': localStorage.getItem('sessionId') || 'default-session' }
      })
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) {
          data.forEach((n: any) => addNotification({ title: n.title, message: n.message, type: n.type }));
        }
      })
      .catch(e => console.error(e));
    }, 10000); 
    
    return () => clearInterval(interval);
  }, [addNotification]);
  
  return null;
}
`;

code = code.replace("function App() {", pollerCode + "\nfunction App() {");
fs.writeFileSync('src/App.tsx', code);
