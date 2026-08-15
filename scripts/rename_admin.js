const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('F:\\BS_Portfolio\\src');

let count = 0;
files.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        let content = fs.readFileSync(file, 'utf8');
        // Carefully replace "/admin" and "/admin/" but avoid false positives
        const newContent = content
            .replace(/\/admin\/login/g, '/plmhrauth/login')
            .replace(/\/admin\/pages/g, '/plmhrauth/pages')
            .replace(/\/admin\/services/g, '/plmhrauth/services')
            .replace(/\/admin\/portfolio/g, '/plmhrauth/portfolio')
            .replace(/\/admin\/process/g, '/plmhrauth/process')
            .replace(/\/admin\/posts/g, '/plmhrauth/posts')
            .replace(/\/admin\/testimonials/g, '/plmhrauth/testimonials')
            .replace(/\/admin\/team/g, '/plmhrauth/team')
            .replace(/\/admin\/faqs/g, '/plmhrauth/faqs')
            .replace(/\/admin\/settings/g, '/plmhrauth/settings')
            .replace(/"\/admin"/g, '"/plmhrauth"')
            .replace(/'\/admin'/g, "'/plmhrauth'")
            .replace(/href="\/admin"/g, 'href="/plmhrauth"')
            .replace(/redirect\("\/admin"\)/g, 'redirect("/plmhrauth")')
            .replace(/push\("\/admin"\)/g, 'push("/plmhrauth")')
            .replace(/href="\/admin\//g, 'href="/plmhrauth/');
            
        if (content !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log(`Updated ${file}`);
            count++;
        }
    }
});

console.log(`Updated ${count} files.`);
