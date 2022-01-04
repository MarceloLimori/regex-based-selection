import * as vscode from 'vscode';
import { window } from 'vscode';

var lastUsedRegex = '';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('regex-based-selection.useRegex1', () => select(0)));
	context.subscriptions.push(vscode.commands.registerCommand('regex-based-selection.useRegex2', () => select(1)));
	context.subscriptions.push(vscode.commands.registerCommand('regex-based-selection.useRegex3', () => select(2)));
	context.subscriptions.push(vscode.commands.registerCommand('regex-based-selection.useRegex4', () => select(3)));
	context.subscriptions.push(vscode.commands.registerCommand('regex-based-selection.useRegex5', () => select(4)));
	context.subscriptions.push(vscode.commands.registerCommand('regex-based-selection.useLastUsed', () => lastUsed()));
	context.subscriptions.push(vscode.commands.registerCommand('regex-based-selection.pickFromList', () => pickFromList()));
}

function select(rgx: number) {
	const expr = vscode.workspace.getConfiguration('regexBasedSelection').get<Array<string>>('regexList');
	if (expr && expr.length > rgx) {
		const e = getRegexFromConfigEntry(expr[rgx]);
		if (e) {
			doSelect(e);
		}
	}
}

function lastUsed() {
	doSelect(lastUsedRegex);
}

async function pickFromList() {
	const expr = vscode.workspace.getConfiguration('regexBasedSelection').get<Array<string>>('regexList');
	if (!expr) { return; }
	const result = await window.showQuickPick(expr);
	if (result) {
		const e = getRegexFromConfigEntry(result);
		if (e) {
			doSelect(e);
		}
	}
}


function doSelect(rgx: string) {
	let re = new RegExp(rgx);
	let matchEmpty = re.exec('');
	if (matchEmpty) {
		window.showErrorMessage('Invalid Regex. Expression must not match an empty string.');
		return;
	}
	lastUsedRegex = rgx;
	const editor = vscode.window.activeTextEditor;
	if (editor && editor.selection.isEmpty) {
		const position = editor.selection.active;
		const document = editor.document;
		const newPos = document.getWordRangeAtPosition(position, new RegExp(rgx));
		if (newPos) {
			editor.selection = new vscode.Selection(newPos.start, newPos.end);
		}
	}
}

function getRegexFromConfigEntry(entry: string) {
	const entryRegex = new RegExp('\\w+[\\s:]+(.*)');
	let matches = entryRegex.exec(entry);
	if (matches) {
		return matches[1];
	} else {
		window.showErrorMessage('Invalid pattern. Should be "name: expression" (no quotes).');
	}
	return null;
}