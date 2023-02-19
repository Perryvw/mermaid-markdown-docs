This is a mermaid flowchart:

```mermaid
flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]
```

This one is loaded from a file:

![diagram from file](./flowchart.mmd)
