with open('web-app/src/app/app.component.ts', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith("import { Component, OnInit,"):
        line = line.replace("OnInit,", "OnInit, OnDestroy,")
    if line.startswith("import { OnDestroy } from '@angular/core';"):
        continue # Remove this line
    if line.strip() == "private":
        continue # Remove the dangling private
    
    new_lines.append(line)

with open('web-app/src/app/app.component.ts', 'w') as f:
    f.writelines(new_lines)
