async function main() {
	const { handler } = await import('./src');
	handler().catch(console.error);
}

void main();
