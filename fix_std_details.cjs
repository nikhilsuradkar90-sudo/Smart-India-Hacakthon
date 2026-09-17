const fs = require('fs');
let code = fs.readFileSync('src/pages/StandardDetailsPage.tsx', 'utf8');

if (!code.includes('/compare?ids=')) {
  code = code.replace(
    'import { useNavigate, useParams } from \'react-router-dom\';',
    'import { useNavigate, useParams } from \'react-router-dom\';\nimport { Scale } from \'lucide-react\';'
  );
  
  code = code.replace(
    '<Button onClick={() => navigate(\'/assistant\')}>Ask AI about this</Button>',
    '<Button variant="outline" onClick={() => navigate(`/compare?ids=${id}`)}><Scale className="h-4 w-4 mr-2" /> Compare</Button>\n              <Button onClick={() => navigate(\'/assistant\')}>Ask AI about this</Button>'
  );
  
  fs.writeFileSync('src/pages/StandardDetailsPage.tsx', code);
}
