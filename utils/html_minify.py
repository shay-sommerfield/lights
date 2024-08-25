 
# minifies the html for injection into a C program
with open('../static/index.html') as f:
    html_content = f.read()

html_content = html_content.replace("\n","\\n").replace('"','\\"')
while "  " in html_content:
    html_content = html_content.replace("  "," ")
print(f'"{html_content}"')  