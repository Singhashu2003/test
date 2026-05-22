If you want to find all old PrimeFlex classes that start with p- in your project:

Regex to search

\bp-[a-zA-Z0-9-]+\b

Examples matched:

p-text-right
p-mt-3
p-mb-2
p-p-3
p-d-flex
p-jc-between

Search only HTML class attributes

class\s*=\s*["'][^"']*\bp-[a-zA-Z0-9-]+\b[^"']*["']

Search specific old utility groups

Text alignment:

\bp-text-(left|center|right|justify)\b

Margin/Padding:

\bp-(m|mt|mr|mb|ml|mx|my|p|pt|pr|pb|pl|px|py)-\d+\b

Flex:

\bp-(d-flex|jc-[a-z-]+|ai-[a-z-]+)\b

VS Code Search

Enable Use Regular Expression (.*) and search:

\bp-[\w-]+\b

This is usually the quickest way to locate all old PrimeFlex utility classes that need migration to the new syntax



good search
\b(?:p-)?(?:d-flex|jc(?:-[a-z]+)?-[a-z-]+|ai(?:-[a-z]+)?-[a-z-]+)\b

  
