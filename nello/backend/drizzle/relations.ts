import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	board: {
		user: r.one.user({
			from: r.board.userId,
			to: r.user.id,
			alias: "board_userId_user_id"
		}),
		lists: r.many.list(),
		users: r.many.user({
			alias: "user_id_board_id_via_boardMember"
		}),
		listArchives: r.many.listArchive(),
	},
	user: {
		boardsUserId: r.many.board({
			alias: "board_userId_user_id"
		}),
		boardsViaBoardMember: r.many.board({
			from: r.user.id.through(r.boardMember.userId),
			to: r.board.id.through(r.boardMember.boardId),
			alias: "user_id_board_id_via_boardMember"
		}),
		listArchives: r.many.listArchive(),
		cardArchives: r.many.cardArchive(),
		cardMembersAssignedBy: r.many.cardMember({
			alias: "cardMember_assignedBy_user_id"
		}),
		cardMembersUserId: r.many.cardMember({
			alias: "cardMember_userId_user_id"
		}),
	},
	list: {
		board: r.one.board({
			from: r.list.boardId,
			to: r.board.id
		}),
		cards: r.many.card(),
		listArchives: r.many.listArchive(),
		cardArchives: r.many.cardArchive(),
	},
	card: {
		list: r.one.list({
			from: r.card.listId,
			to: r.list.id
		}),
		cardArchives: r.many.cardArchive(),
		cardMembers: r.many.cardMember(),
	},
	listArchive: {
		user: r.one.user({
			from: r.listArchive.archivedBy,
			to: r.user.id
		}),
		board: r.one.board({
			from: r.listArchive.boardId,
			to: r.board.id
		}),
		list: r.one.list({
			from: r.listArchive.listId,
			to: r.list.id
		}),
	},
	cardArchive: {
		user: r.one.user({
			from: r.cardArchive.archivedBy,
			to: r.user.id
		}),
		list: r.one.list({
			from: r.cardArchive.listId,
			to: r.list.id
		}),
		card: r.one.card({
			from: r.cardArchive.cardId,
			to: r.card.id
		}),
	},
	cardMember: {
		userAssignedBy: r.one.user({
			from: r.cardMember.assignedBy,
			to: r.user.id,
			alias: "cardMember_assignedBy_user_id"
		}),
		userUserId: r.one.user({
			from: r.cardMember.userId,
			to: r.user.id,
			alias: "cardMember_userId_user_id"
		}),
		card: r.one.card({
			from: r.cardMember.cardId,
			to: r.card.id
		}),
	},
}))