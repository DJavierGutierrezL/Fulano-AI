// src/App.tsx
// ... (imports y funciones iniciales sin cambios)

  const handleSendMessage = async (inputText: string) => {
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = { id: Date.now().toString(), text: inputText, sender: Sender.USER };
    setMessages((prev) => [...prev, userMessage]);

    try {
        let response: Response;
        
        // NUEVA LÓGICA PARA EL COMANDO /faceswap
        if (inputText.toLowerCase().startsWith('/faceswap ')) {
            const urls = inputText.substring(10).trim().split(' ');
            if (urls.length < 2) throw new Error("El comando /faceswap requiere dos URLs separadas por un espacio.");

            const source_image_url = urls[0];
            const target_image_url = urls[1];
            
            response = await fetch(`${API_BASE}/api/face-swap`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source_image_url, target_image_url }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Error en el servidor de face swap");
            }

            const data = await response.json();
            const imageUrl = `data:image/jpeg;base64,${data.image_base64}`;
            const botMessage: Message = { id: `bot-${Date.now()}`, imageUrl, sender: Sender.BOT };
            setMessages((prev) => [...prev, botMessage]);

        } else if (inputText.toLowerCase().startsWith('/imagen ')) {
            // ... (lógica de /imagen sin cambios)
        } else {
            // ... (lógica de chat con Gemini sin cambios)
        }

    } catch (error) {
        // ... (manejo de errores sin cambios)
    } finally {
        setIsLoading(false);
    }
  };

// ... (resto del archivo sin cambios)